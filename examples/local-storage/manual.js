import React from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from '../../src';
import * as styles from './styles';

const commit = ({ message }) => {
  window.localStorage.setItem('message', message);
};

function LocalStorageForm({ form, onSubmit }) {
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
          form.setValue('message', event.target.value).then(form.commit);
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
  form: PropTypes.shape({
    commit: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default () => (
  <Form
    component={LocalStorageForm}
    commit={commit}
    initialValues={{
      message: window.localStorage.getItem('message') || '',
    }}
    preventChangeDuringCommit={false}
  />
);
