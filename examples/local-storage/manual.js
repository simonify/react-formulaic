import React from 'react';
import PropTypes from 'prop-types';
import { Field, StatefulForm } from '../../src';
import * as styles from './styles';

const onCommit = ({ message }) => {
  window.localStorage.setItem('message', message);
};

function LocalStorageForm({ getFormState, onSubmit }) {
  return (
    <form
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial', padding: 25 }}
      onSubmit={onSubmit}
    >
      <div style={{ fontSize: 19 }}>
        The contents of the textarea below will persist across refreshes
        (depending on local storage settings).
      </div>
      <Field
        field="message"
        style={styles.textarea}
        type="textarea"
        onChange={(event) => {
          const state = getFormState();
          state.setValue('message', event.target.value).then(state.commit);
        }}
      />
      <div style={{ fontSize: 17 }}>
        This implementation uses a custom <code>Form</code> component to manually
        call <code>form.commit</code> from a custom <code>Field</code> component’s{' '}
        <code>onChange</code> prop.
      </div>
    </form>
  );
}

LocalStorageForm.propTypes = {
  getFormState: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default () => (
  <StatefulForm
    component={LocalStorageForm}
    initialValues={{
      message: window.localStorage.getItem('message') || '',
    }}
    onCommit={onCommit}
  />
);
