import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BaseForm, { getInvalidFields, formPropTypes, formDefaultProps } from '../BaseForm';
import { UNKNOWN_COMMIT_ERROR } from '../constants';
import * as actions from './actions';

export reducer from './reducer';
export { actions };

const connectToStore = connect(
  (state, { id }) => ({ formState: state.forms[id] }),
  actions,
);

class ReduxForm extends Component {
  static propTypes = {
    ...formPropTypes,
    id: PropTypes.string.isRequired, // redux formss require an id
    initializeForm: PropTypes.func.isRequired,
    updateFormState: PropTypes.func.isRequired,
    destroyForm: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
  };

  static defaultProps = {
    ...formDefaultProps,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      isReady: !!props.formState,
    };
  }

  componentDidMount() {
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

    this.props.initializeForm(this.props.id, {
      commitError: null,
      dirtyFields: [],
      focusedField: null,
      initialValues: { ...normalizedInitialValues },
      isCommitting: false,
      touchedFields: [],
      values: { ...normalizedInitialValues },
      invalidFields,
    });
  }

  componentWillUnmount() {
    this.props.destroyForm(this.props.id);
  }

  onChangeField = (key, value) => {
    if (this.unmounted) {
      return Promise.resolve(new Error('component already unmounted'));
    }

    const {
      resetCommitErrorOnChange,
      schema,
      formState: {
        dirtyFields,
        initialValues,
        values,
      },
    } = this.props;

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

    this.updateFormState({
      ...(resetCommitErrorOnChange ? ({
        commitError: null,
      }) : null),
      dirtyFields: newDirtyFields,
      invalidFields: newInvalidFields,
      values: newValues,
    });

    return Promise.resolve();
  };

  onCancel = () => {
    const {
      schema,
      formState: {
        initialValues,
      },
    } = this.props;

    const invalidFields = getInvalidFields(schema, initialValues, initialValues);

    this.updateFormState({
      commitError: null,
      values: initialValues,
      dirtyFields: [],
      invalidFields,
    });
  };

  onBeginCommit = () => {
    if (this.props.isCommitting) {
      return Promise.reject(new Error('already committing'));
    }

    this.updateFormState({
      commitError: null,
      isCommitting: true,
    });

    return Promise.resolve();
  }

  onCommit = () => {
    const {
      onCommit,
      formState: {
        dirtyFields,
        values,
      },
    } = this.props;

    const commitRes = onCommit(values, { dirtyFields });
    const finalize = () => this.updateFormState({
      dirtyFields: [],
      isCommitting: false,
      initialValues: values,
      invalidFields: {},
    });

    const reject = (commitError) => {
      this.onCommitError(commitError);
      return Promise.reject(commitError);
    };

    if (typeof commitRes === 'object') {
      if (typeof commitRes.then === 'function') {
        return commitRes.then(finalize, reject);
      }

      if (commitRes instanceof Error) {
        return reject(commitRes);
      }

      console.warn('Invalid commit response:', commitRes);

      return reject(new Error(UNKNOWN_COMMIT_ERROR));
    }

    if (commitRes === false) {
      return reject(new Error(UNKNOWN_COMMIT_ERROR));
    }

    return finalize();
  };

  onCommitError = commitError => (
    this.updateFormState({
      isCommitting: false,
      invalidFields: commitError.fields ? commitError.fields : undefined,
      commitError,
    })
  );

  onBlurField = (field) => {
    if (this.props.formState.focusedField === field) {
      this.updateFormState({
        focusedField: null,
      });
    }
  }

  onFocusField = focusedField => this.updateFormState({ focusedField });

  onTouchField = field => (
    !this.props.formState.touchedFields.includes(field) &&
    this.updateFormState({
      touchedFields: [
        ...this.props.formState.touchedFields,
        field,
      ],
    })
  );

  updateFormState(state) {
    if (!this.unmounted) {
      this.props.updateFormState(this.props.id, state);
    }
  }

  render() {
    const {
      destroyForm,
      initializeForm,
      initialValues,
      formState,
      normalizeInitialValues,
      overwriteWhenInitialValuesChange,
      resetCommitErrorOnChange,
      updateFields,
      updateFormState,
      ...props
    } = this.props;

    if (!formState) {
      return null;
    }

    const {
      commitError,
      dirtyFields,
      isCommitting,
      invalidFields,
      values,
    } = formState;

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

export default connectToStore(ReduxForm);
