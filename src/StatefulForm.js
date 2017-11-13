import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowEquals from 'shallow-equals';
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
      commitId: 0,
      commitError: null,
      dirtyFields: [],
      focusedField: null,
      initialValues: { ...normalizedInitialValues },
      isCommitting: false,
      touchedFields: [],
      values: { ...normalizedInitialValues },
      invalidFields,
    };
  }

  componentWillReceiveProps(props) {
    if (
      !props.overwriteWhenInitialValuesChange ||
      shallowEquals(this.props.initialValues, props.initialValues)
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
        commitError,
        dirtyFields,
        initialValues,
        values,
      }) => {
        const { resetCommitErrorOnChange, schema } = this.props;
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
          commitError: resetCommitErrorOnChange ? null : commitError,
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

  onBeginCommit = () => {
    if (this.state.isCommitting) {
      return Promise.reject(new Error('already committing'));
    }

    return new Promise(resolve => this.setState(({ commitId }) => ({
      commitId: commitId + 1,
      commitError: null,
      isCommitting: true,
    }), () => resolve(this.state.commitId)));
  }

  onCommit = commitId => new Promise((resolve, reject) => {
    const { onCommit } = this.props;
    const { dirtyFields, values } = this.state;
    const commitRes = onCommit(values, { dirtyFields });
    const setIfSafe = (diff, fn) => (
      !this.unmounted &&
      this.setState(({ commitId: currentCommitId }) => {
        if (commitId === currentCommitId) {
          return diff;
        }

        return undefined;
      }, fn)
    );

    const success = () => setIfSafe({
      dirtyFields: [],
      isCommitting: false,
      initialValues: values,
      invalidFields: {},
    }, resolve);

    const fail = (commitError) => {
      this.onCommitError(commitError);
      reject(commitError);
    };

    if (typeof commitRes === 'object') {
      if (typeof commitRes.then === 'function') {
        commitRes.then(success, fail);
        return;
      }

      if (commitRes instanceof Error) {
        fail(commitRes);
        return;
      }

      console.warn('Invalid commit response:', commitRes);

      fail(new Error(UNKNOWN_COMMIT_ERROR));

      return;
    }

    if (commitRes === false) {
      fail(new Error(UNKNOWN_COMMIT_ERROR));
      return;
    }

    success();
  });

  onCommitError = commitError => this.setState({
    ...(commitError.fields ? { invalidFields: commitError.fields } : null),
    isCommitting: false,
    commitError,
  });

  onBlurField = field => this.setState(({ focusedField }) => {
    if (focusedField === field) {
      return { focusedField: null };
    }

    return undefined;
  });

  onFocusField = focusedField => this.setState({ focusedField });

  onTouchField = field => this.setState(({ touchedFields }) => {
    if (touchedFields.includes(field)) {
      return undefined;
    }

    return {
      touchedFields: [
        ...touchedFields,
        field,
      ],
    };
  });

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
      onChangeState,
      overwriteWhenInitialValuesChange,
      resetCommitErrorOnChange,
      ...props
    } = this.props;

    return (
      <BaseForm
        {...props}
        commitError={commitError}
        dirtyFields={dirtyFields}
        isCommitting={isCommitting}
        invalidFields={invalidFields}
        onBeginCommit={this.onBeginCommit}
        onBlurField={this.onBlurField}
        onCancel={this.onCancel}
        onChangeField={this.onChangeField}
        onCommit={this.onCommit}
        onCommitError={this.onCommitError}
        onFocusField={this.onFocusField}
        onTouchField={this.onTouchField}
        values={values}
      />
    );
  }
}
