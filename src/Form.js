import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createDispatcher from 'create-dispatcher';
import { UNKNOWN_COMMIT_ERROR, UNKNOWN_VALIDATION_FAILURE } from './constants';

let FORM_ID = 0;

export default class Form extends Component {
  static contextTypes = {
    forms: PropTypes.object,
  };

  static childContextTypes = {
    form: PropTypes.object.isRequired,
    forms: PropTypes.object.isRequired,
  };

  static propTypes = {
    commit: PropTypes.func.isRequired,
    commitOnChange: PropTypes.bool,
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
    id: PropTypes.string,
    initialValues: PropTypes.object,
    normalizeFieldValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ]),
    normalizeInitialValues: PropTypes.func,
    onChangeState: PropTypes.func,
    overwriteWhenInitialValuesChange: PropTypes.bool,
    preventChangeWhenInvalid: PropTypes.bool,
    preventChangeDuringCommit: PropTypes.bool,
    schema: PropTypes.object,
  };

  static defaultProps = {
    commitOnChange: false,
    component: 'form',
    id: null,
    initialValues: {},
    normalizeFieldValue: undefined,
    normalizeInitialValues: n => n,
    onChangeState: null,
    overwriteWhenInitialValuesChange: false,
    preventChangeWhenInvalid: false,
    preventChangeDuringCommit: true,
    schema: {},
  };

  constructor(props, context) {
    super(props, context);

    const {
      id = ++FORM_ID,
      initialValues,
      preventChangeDuringCommit,
      normalizeInitialValues,
    } = this.props;

    const normalizedInitialValues = normalizeInitialValues(initialValues);
    const invalidFields = this.getInvalidFields(
      normalizedInitialValues,
      normalizedInitialValues,
    );

    // We're putting some function pointers in state so everything gets
    // provided to the WrappedComponent as the `form` prop.
    this.dispatcher = createDispatcher();
    this.forms = (context.forms || new Map()).set(id, this);
    this.state = {
      id,
      invalidFields,
      preventChangeDuringCommit,
      cancel: this.cancel,
      changeId: 0,
      commit: this.commit,
      commitError: null,
      dirtyFields: [],
      initialValues: { ...normalizedInitialValues },
      isCommitting: false,
      isDirty: false,
      isInvalid: Object.keys(invalidFields).length > 0,
      setValue: this.setValue,
      values: { ...normalizedInitialValues },
    };
  }

  getChildContext = () => ({
    form: this,
    forms: this.forms,
  });

  componentWillReceiveProps(props) {
    if (
      !props.overwriteWhenInitialValuesChange ||
      this.props.initialValues === props.initialValues
    ) {
      return;
    }

    const normalizedInitialValues = props.normalizeInitialValues(props.initialValues);
    const cleanKeys = (
      Object.keys(this.state.initialValues).filter(key => (
        this.state.values[key] === this.props.initialValues[key]
      ))
    );

    if (!cleanKeys.length) {
      this.setState({ initialValues: normalizedInitialValues });
      return;
    }

    const values = cleanKeys.reduce((state, key) => Object.assign(state, {
      [key]: normalizedInitialValues[key],
    }), { ...this.state.values });

    const invalidFields = this.getInvalidFields(values, this.state.values);

    this.setState({
      isInvalid: Object.keys(invalidFields).length > 0,
      initialValues: normalizedInitialValues,
      invalidFields,
      values,
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.onChangeState && this.state !== nextState) {
      this.props.onChangeState(this.state, nextState);
    }
  }

  componentDidUpdate() {
    this.dispatcher.dispatch();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.forms.delete(this.state.id);
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.commit();
  }

  getValueForKey = key => this.state.values[key];

  getInvalidFields = (values, previousValues) => (
    Object.entries(this.props.schema).reduce((invalidFields, [schemaKey, validator]) => {
      const res = validator(values[schemaKey], previousValues[schemaKey]);

      if (res === true) {
        return invalidFields;
      }

      if (!invalidFields[schemaKey]) {
        invalidFields[schemaKey] = []; // eslint-disable-line
      }

      if (res === false) {
        if (!invalidFields[schemaKey].length) {
          invalidFields[schemaKey].push(UNKNOWN_VALIDATION_FAILURE);
        }
      } else if (Array.isArray(res)) {
        invalidFields[schemaKey] = invalidFields[schemaKey].concat(res); // eslint-disable-line
      } else {
        invalidFields[schemaKey].push(res);
      }

      return invalidFields;
    }, {})
  );

  getNormalizedValueForKey = (key, value, prevValue) => {
    if (this.props.normalizeFieldValue != null) {
      if (typeof this.props.normalizeFieldValue === 'function') {
        return this.props.normalizeFieldValue(key, value, prevValue);
      }

      if (typeof this.props.normalizeFieldValue[key] === 'function') {
        return this.props.normalizeFieldValue[key](value, prevValue);
      }

      return value;
    }

    return value;
  };

  setValue = (key, baseValue, { skipValidation = false } = {}) => (
    new Promise((resolve, reject) => {
      if (this.unmounted) {
        return;
      }

      const {
        commitOnChange,
        preventChangeDuringCommit,
        preventChangeWhenInvalid,
        schema,
      } = this.props;

      if (preventChangeDuringCommit && this.state.isCommitting) {
        reject(new Error('commit in progress'));
        return;
      }

      const prevValue = this.state.values[key];
      const value = this.getNormalizedValueForKey(key, baseValue, prevValue);
      const isInvalid = (
        !skipValidation &&
        schema[key] &&
        !schema[key](value, prevValue)
      );

      if (preventChangeWhenInvalid && isInvalid) {
        reject(new Error('fields are invalid'));
        return;
      }

      this.setState(({
        dirtyFields,
        initialValues,
        values,
      }) => {
        const newValues = {
          ...values,
          [key]: value,
        };

        const newInvalidFields = this.getInvalidFields(newValues, values);

        let newDirtyFields = dirtyFields;

        if (value === initialValues[key]) {
          newDirtyFields = dirtyFields.filter(field => field !== key);
        } else if (!dirtyFields.includes(key)) {
          newDirtyFields = [...dirtyFields, key];
        }

        return {
          dirtyFields: newDirtyFields,
          isDirty: newDirtyFields.length > 0,
          isInvalid: Object.keys(newInvalidFields).length > 0,
          invalidFields: newInvalidFields,
          values: newValues,
        };
      }, () => {
        if (
          commitOnChange === true ||
          (Array.isArray(commitOnChange) && commitOnChange.includes(key)) ||
          (
            typeof commitOnChange === 'function' &&
            commitOnChange(key, value, prevValue)
          )
        ) {
          this.commit();
        }

        resolve();
      });
    })
  );

  cancel = () => {
    if (this.state.isCommitting) {
      return;
    }

    const { initialValues } = this.state;
    const invalidFields = this.getInvalidFields(initialValues, initialValues);

    this.setState({
      commitError: null,
      values: initialValues,
      dirtyFields: [],
      isDirty: false,
      isInvalid: Object.keys(invalidFields).length > 0,
      invalidFields,
    });
  };

  commit = ({ commitWhenNotDirty, ignoreValidation } = {}) => {
    if (this.state.isCommitting) {
      return;
    }

    if (this.state.isInvalid && !ignoreValidation) {
      return;
    }

    if (commitWhenNotDirty !== false && !this.state.dirtyFields.length) {
      return;
    }

    this.setState(({ changeId }) => ({
      changeId: changeId + 1,
      commitError: null,
      isCommitting: true,
    }), () => {
      const { changeId, values } = this.state;
      const commitRes = this.props.commit(values, {
        dirtyFields: this.state.dirtyFields,
        props: this.props,
      });

      const setIfSafe = diff => this.setState(({ changeId: currentChangeId }) => {
        if (changeId === currentChangeId) {
          return diff;
        }

        return undefined;
      });

      const finalize = () => !this.unmounted && setIfSafe({
        dirtyFields: [],
        isCommitting: false,
        isDirty: false,
        isInvalid: false,
        initialValues: values,
        invalidFields: {},
      });

      const reject = commitError => !this.unmounted && setIfSafe({
        isCommitting: false,
        commitError,
      });

      if (typeof commitRes === 'object') {
        if (typeof commitRes.then === 'function') {
          commitRes.then(finalize, reject);
          return;
        }

        if (commitRes instanceof Error) {
          reject(commitRes);
          return;
        }

        console.warn('Invalid commit response:', commitRes);

        reject(new Error(UNKNOWN_COMMIT_ERROR));

        return;
      }

      if (commitRes === false) {
        reject(new Error(UNKNOWN_COMMIT_ERROR));
        return;
      }

      finalize();
    });
  }

  render() {
    const {
      component: ComponentType,
      commit,
      commitOnChange,
      initialValues,
      normalizeFieldValue,
      normalizeInitialValues,
      onChangeState,
      overwriteWhenInitialValuesChange,
      preventChangeWhenInvalid,
      preventChangeDuringCommit,
      schema,
      ...props
    } = this.props;

    return (
      <ComponentType
        {...props}
        form={this.state}
        onSubmit={this.onSubmit}
      />
    );
  }
}
