import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createDispatcher from 'create-dispatcher';
import createFormsContext from './createFormsContext';
import { UNKNOWN_VALIDATION_FAILURE } from './constants';

let FORM_ID = 0;

export function getNormalizedValueForKey(
  key,
  value,
  prevValue,
  functionOrObject,
) {
  if (functionOrObject != null) {
    if (typeof functionOrObject === 'function') {
      return functionOrObject(key, value, prevValue);
    }

    if (typeof functionOrObject[key] === 'function') {
      return functionOrObject[key](value, prevValue);
    }

    return value;
  }

  return value;
}

export const getInvalidFields = (schema, values, previousValues) => (
  Object.entries(schema).reduce((invalidFields, [schemaKey, validator]) => {
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

export const formPropTypes = {
  onCommit: PropTypes.func.isRequired,
  getNormalizedValueForKey: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  resetCommitErrorOnChange: PropTypes.bool,
  normalizeInitialValues: PropTypes.func,
};

export const formDefaultProps = {
  normalizeInitialValues: n => n,
  resetCommitErrorOnChange: true,
  schema: {},
};

export default class BaseForm extends Component {
  static contextTypes = {
    forms: PropTypes.object,
  };

  static childContextTypes = {
    form: PropTypes.func.isRequired,
    forms: PropTypes.object.isRequired,
  };

  static propTypes = {
    onBeginCommit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChangeField: PropTypes.func.isRequired,
    onCommit: PropTypes.func.isRequired,
    onCommitError: PropTypes.func.isRequired,
    onBlurField: PropTypes.func.isRequired,
    onFocusField: PropTypes.func.isRequired,
    onTouchField: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    commitError: PropTypes.any,
    commitOnChange: PropTypes.bool,
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
    dirtyFields: PropTypes.arrayOf(PropTypes.string),
    dirtyValues: PropTypes.object,
    getNormalizedValueForKey: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ]),
    isCommitting: PropTypes.bool,
    isValidating: PropTypes.bool,
    id: PropTypes.string,
    invalidFields: PropTypes.object,
    onBeforeCommit: PropTypes.func,
    preventCancelWhenClean: PropTypes.bool,
    preventChangeWhenCommitting: PropTypes.bool,
    preventChangeWhenInvalid: PropTypes.bool,
    preventCommitWhenClean: PropTypes.bool,
    preventCommitWhenCommitting: PropTypes.bool,
    preventCommitWhenInvalid: PropTypes.bool,
    readOnly: PropTypes.bool,
    values: PropTypes.object,
  };

  static defaultProps = {
    component: 'form',
    commitError: null,
    commitOnChange: false,
    dirtyFields: [],
    dirtyValues: null,
    getNormalizedValueForKey: (key, value) => value,
    isCommitting: false,
    isValidating: false,
    id: null,
    invalidFields: {},
    onBeforeCommit: null,
    preventCancelWhenClean: false,
    preventChangeWhenCommitting: false,
    preventChangeWhenInvalid: false,
    preventCommitWhenClean: false,
    preventCommitWhenCommitting: false,
    preventCommitWhenInvalid: false,
    readOnly: false,
    values: {},
  };

  constructor(props, context) {
    super(props, context);

    const {
      id = ++FORM_ID,
    } = this.props;

    this.dispatcher = createDispatcher();
    this.forms = (context.forms || createFormsContext()).set(id, this.getState);
    this.id = id;
  }

  getChildContext = () => ({
    form: this.getState,
    forms: this.forms,
  });

  componentWillReceiveProps(props) {
    if (this.props.id !== props.id) {
      const {
        id = ++FORM_ID,
      } = props;

      this.forms.set(id, this.getState);
      this.forms.delete(this.props.id);
      this.id = id;
    }
  }

  componentDidUpdate() {
    this.dispatcher.dispatch();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.forms.delete(this.id);
  }

  onCancel = () => {
    if (this.props.preventCancelWhenClean && !this.isDirty()) {
      return;
    }

    this.props.onCancel();
  }

  onCommit = () => {
    if (
      (this.props.preventCommitWhenCommitting && this.props.isCommitting) ||
      (this.props.preventCommitWhenInvalid && this.isInvalid()) ||
      (this.props.preventCommitWhenClean && !this.isDirty())
    ) {
      return Promise.reject(new Error('invalid state to commit'));
    }

    return this.props.onBeginCommit().then((res) => {
      if (this.props.onBeforeCommit) {
        const beforeCommitRes = this.props.onBeforeCommit(this.getState);

        if (beforeCommitRes != null && typeof beforeCommitRes.then === 'function') {
          return beforeCommitRes.then(
            () => res,
            error => this.props.onCommitError(error, error.fields),
          );
        }
      }

      return Promise.resolve(res);
    }).then(this.props.onCommit).then(null, () => {});
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.onCommit();
  };

  onChangeField = (key, baseValue, { skipValidation = false } = {}) => {
    const {
      commitOnChange,
      preventChangeWhenInvalid,
      readOnly,
      schema,
    } = this.props;

    if (readOnly) {
      return Promise.reject(new Error('form is read only'));
    }

    const prevValue = this.props.values[key];
    const value = getNormalizedValueForKey(
      key,
      baseValue,
      prevValue,
      this.props.getNormalizedValueForKey,
    );

    const isInvalid = (
      !skipValidation &&
      schema[key] &&
      !schema[key](value, prevValue)
    );

    if (preventChangeWhenInvalid && isInvalid) {
      return Promise.reject(new Error('fields are invalid'));
    }

    const res = this.props.onChangeField(key, value, prevValue);

    if (commitOnChange) {
      if (res != null && typeof res.then === 'function') {
        res.then(this.onCommit);
      } else {
        this.onCommit();
      }
    }

    return Promise.resolve(res);
  };

  getValueForKey = key => this.props.values[key];

  getState = () => ({
    cancel: this.onCancel,
    commit: this.onCommit,
    commitError: this.props.commitError,
    dirtyFields: this.props.dirtyFields,
    getValueForKey: this.getValueForKey,
    id: this.id,
    isCommitting: this.props.isCommitting,
    isDirty: this.isDirty(),
    isInvalid: this.isInvalid(),
    invalidFields: this.props.invalidFields,
    onBlurField: this.props.onBlurField,
    onFocusField: this.props.onFocusField,
    onTouchField: this.props.onTouchField,
    preventChangeWhenCommitting: this.props.preventChangeWhenCommitting,
    setValue: this.onChangeField,
    subscribe: this.dispatcher.subscribe,
    values: this.props.values,
  });

  isDirty = (props = this.props) => props.dirtyFields.length > 0;
  isInvalid = (props = this.props) => Object.keys(props.invalidFields).length > 0;

  render() {
    const {
      component: ComponentType,
      getNormalizedValueForKey: omit,
      commitError,
      commitOnChange,
      dirtyFields,
      dirtyValues,
      invalidFields,
      isCommitting,
      isValidating,
      onBeforeCommit,
      onBeginCommit,
      onBlurField,
      onChangeField,
      onCommit,
      onCommitError,
      onFocusField,
      onTouchField,
      preventCancelWhenClean,
      preventChangeWhenCommitting,
      preventChangeWhenInvalid,
      preventCommitWhenClean,
      preventCommitWhenCommitting,
      preventCommitWhenInvalid,
      readOnly,
      schema,
      values,
      ...props
    } = this.props;

    const spreadProps = typeof ComponentType === 'function'
      ? { getFormState: this.getState }
      : null;

    return (
      <ComponentType {...props} {...spreadProps} onSubmit={this.onSubmit} />
    );
  }
}
