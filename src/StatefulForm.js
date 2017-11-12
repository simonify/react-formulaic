import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { UNKNOWN_COMMIT_ERROR } from './constants';
import BaseForm, { getInvalidFields, formPropTypes, formDefaultProps } from './BaseForm';

export default class StatefulForm extends Component {
  static propTypes = {
    ...formPropTypes,
    onCommit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    normalizeInitialValues: PropTypes.func,
    onChangeState: PropTypes.func,
    overwriteWhenInitialValuesChange: PropTypes.bool,
  };

  static defaultProps = {
    ...formDefaultProps,
    initialValues: {},
    onChangeState: null,
    overwriteWhenInitialValuesChange: false,
  };

  constructor(props, context) {
    super(props, context);

    const {
      initialValues,
      normalizeInitialValues,
      schema,
    } = this.props;

    const normalizedInitialValues = normalizeInitialValues(initialValues);
    const invalidFields = getInvalidFields(
      schema,
      normalizedInitialValues,
      normalizedInitialValues,
    );

    this.state = {
      changeId: 0,
      commitError: null,
      dirtyFields: [],
      initialValues: { ...normalizedInitialValues },
      isCommitting: false,
      values: { ...normalizedInitialValues },
      invalidFields,
    };
  }

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

    const invalidFields = getInvalidFields(
      this.props.schema,
      values,
      this.state.values,
    );

    this.setState({
      initialValues: normalizedInitialValues,
      invalidFields,
      values,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state !== prevState && this.props.onChangeState) {
      this.props.onChangeState(prevState, this.state);
    }
  }

  onChangeField = (key, value) => (
    new Promise((resolve, reject) => {
      if (this.unmounted) {
        reject(new Error('component already unmounted'));
        return;
      }

      this.setState(({
        dirtyFields,
        initialValues,
        values,
      }) => {
        const { schema } = this.props;
        const newValues = {
          ...values,
          [key]: value,
        };

        const newInvalidFields = getInvalidFields(schema, newValues, values);

        let newDirtyFields = dirtyFields;

        if (value === initialValues[key]) {
          newDirtyFields = dirtyFields.filter(field => field !== key);
        } else if (!dirtyFields.includes(key)) {
          newDirtyFields = [...dirtyFields, key];
        }

        return {
          dirtyFields: newDirtyFields,
          invalidFields: newInvalidFields,
          values: newValues,
        };
      }, resolve);
    })
  );

  onCancel = () => {
    const { initialValues } = this.state;
    const { schema } = this.props;
    const invalidFields = getInvalidFields(schema, initialValues, initialValues);

    this.setState({
      commitError: null,
      values: initialValues,
      dirtyFields: [],
      invalidFields,
    });
  };

  onCommit = () => (
    new Promise(resolve => this.setState(({ changeId }) => ({
      changeId: changeId + 1,
      commitError: null,
      isCommitting: true,
    }), () => {
      const { onCommit } = this.props;
      const { changeId, dirtyFields, values } = this.state;
      const commitRes = onCommit(values, { dirtyFields });
      const setIfSafe = (diff, fn) => (
        !this.unmounted &&
        this.setState(({ changeId: currentChangeId }) => {
          if (changeId === currentChangeId) {
            return diff;
          }

          return undefined;
        }, fn)
      );

      const finalize = () => !setIfSafe({
        dirtyFields: [],
        isCommitting: false,
        initialValues: values,
        invalidFields: {},
      }, resolve);

      const reject = commitError => setIfSafe({
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
    }))
  );

  render() {
    const {
      commitError,
      dirtyFields,
      isCommitting,
      invalidFields,
      values,
    } = this.state;

    const {
      initialValues,
      normalizeInitialValues,
      overwriteWhenInitialValuesChange,
      ...props
    } = this.props;

    return (
      <BaseForm
        {...props}
        commitError={commitError}
        dirtyFields={dirtyFields}
        isCommitting={isCommitting}
        invalidFields={invalidFields}
        onCancel={this.onCancel}
        onChangeField={this.onChangeField}
        onCommit={this.onCommit}
        values={values}
      />
    );
  }
}
