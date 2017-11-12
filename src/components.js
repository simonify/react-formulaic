import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import createField from './createField';
import createFieldErrors from './createFieldErrors';
import createCancelButton from './createCancelButton';
import createCommitButton from './createCommitButton';

export FormsContext from './FormsContext';
export FormProvider from './FormProvider';
export BaseForm from './BaseForm';
export StatefulForm from './StatefulForm';

function createConnected(name, createComponent) {
  class ConnectedComponent extends PureComponent {
    static contextTypes = {
      form: PropTypes.func.isRequired,
    };

    constructor(props, context) {
      super(props, context);
      this.component = createComponent(context.form);
    }

    componentDidMount() {
      this.unsubscribe = this.context.form().subscribe(
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
export const FormState = createConnected(
  'FormState', getFormState => ({ children }) => children(getFormState()),
);

export const DirtyField = createConnected(
  'DirtyField',
  getFormState => ({ children, field }) => children(getFormState().dirtyFields.includes(field)),
);

export const InvalidField = createConnected(
  'InvalidField',
  getFormState => ({ children, field }) => children(getFormState().invalidFields[field] || false),
);

export const FieldState = createConnected(
  'FieldState',
  getFormState => ({ children, field }) => {
    const state = getFormState();

    return children({
      isDirty: state.dirtyFields.includes(field),
      isInvalid: !!state.invalidFields[field],
      invalidErrors: state.invalidFields[field] || null,
      value: state.values[field],
    });
  },
);
