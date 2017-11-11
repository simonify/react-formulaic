import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createField from './createField';
import createFieldErrors from './createFieldErrors';
import createCancelButton from './createCancelButton';
import createCommitButton from './createCommitButton';

export FormsContext from './FormsContext';
export FormProvider from './FormProvider';
export Form from './Form';

function createConnected(name, createComponent) {
  class ConnectedComponent extends Component {
    static contextTypes = {
      form: PropTypes.shape({
        dispatcher: PropTypes.shape({
          subscribe: PropTypes.func.isRequired,
        }),
      }).isRequired,
    };

    constructor(props, context) {
      super(props, context);
      this.component = createComponent(context.form);
    }

    componentDidMount() {
      this.unsubscribe = this.context.form.dispatcher.subscribe(
        () => this.forceUpdate(),
      );
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    render() {
      return <this.component {...this.props} />;
    }
  }

  ConnectedComponent.displayName = `Connected${name}`;

  return ConnectedComponent;
}

export const Field = createConnected('Field', createField);
export const FieldErrors = createConnected('FieldErrors', createFieldErrors);
export const CancelButton = createConnected('CancelButton', createCancelButton);
export const CommitButton = createConnected('CommitButton', createCommitButton);
export const CommitStatus = createConnected(
  'CommitStatus', form => ({ children }) => children({
    isCommitting: form.state.isCommitting,
    commitError: form.state.commitError,
  }),
);

export const DirtyField = createConnected(
  'DirtyField', form => ({ children, field }) => children(form.state.dirtyFields.includes(field)),
);

export const InvalidField = createConnected(
  'InvalidField', form => ({ children, field }) => children(form.state.invalidFields[field] || false),
);

export const FieldState = createConnected(
  'FieldState', form => ({ children, field }) => children({
    isDirty: form.state.dirtyFields.includes(field),
    isInvalid: !!form.state.invalidFields[field],
    invalidErrors: form.state.invalidFields[field] || null,
    value: form.state.values[field],
  }),
);
