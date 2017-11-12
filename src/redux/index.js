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
      initialValues: { ...normalizedInitialValues },
      isCommitting: false,
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
      id,
      schema,
      updateFormState,
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

    updateFormState(id, {
      dirtyFields: newDirtyFields,
      invalidFields: newInvalidFields,
      values: newValues,
    });

    return Promise.resolve();
  };

  onCancel = () => {
    const {
      id,
      schema,
      formState: {
        initialValues,
      },
    } = this.props;

    const invalidFields = getInvalidFields(schema, initialValues, initialValues);

    this.props.updateFormState(id, {
      commitError: null,
      values: initialValues,
      dirtyFields: [],
      invalidFields,
    });
  };

  onCommit = () => {
    const {
      id,
      onCommit,
      updateFormState,
      formState: {
        dirtyFields,
        values,
      },
    } = this.props;

    updateFormState(id, {
      commitError: null,
      isCommitting: true,
    });

    const commitRes = onCommit(values, { dirtyFields });
    const setIfSafe = (diff) => {
      if (!this.unmounted) {
        updateFormState(id, diff);
        return Promise.resolve();
      }

      return Promise.reject(new Error('unmounted'));
    };

    const finalize = () => !setIfSafe({
      dirtyFields: [],
      isCommitting: false,
      initialValues: values,
      invalidFields: {},
    });

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
  };

  render() {
    const {
      destroyForm,
      initializeForm,
      initialValues,
      formState,
      normalizeInitialValues,
      overwriteWhenInitialValuesChange,
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
        onCancel={this.onCancel}
        onChangeField={this.onChangeField}
        onCommit={this.onCommit}
        values={values}
      />
    );
  }
}

export default connectToStore(ReduxForm);
