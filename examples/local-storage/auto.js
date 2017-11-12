import React from 'react';
import { Field, Form } from '../../src';
import * as styles from './styles';

const onCommit = ({ message }) => {
  window.localStorage.setItem('message', message);
};

export default function LocalStorageForm() {
  return (
    <Form
      initialValues={{
        message: window.localStorage.getItem('message') || '',
      }}
      onCommit={onCommit}
      style={{ padding: 25 }}
      commitOnChange
    >
      <div style={{ fontSize: 19 }}>
        The contents of the textarea below will persist across refreshes
        (depending on local storage settings).
      </div>
      <Field field="message" style={styles.textarea} type="textarea" />
      <div style={{ fontSize: 17 }}>
        This implementation uses the <code>commitOnChange</code> flag to{' '}
        automatically commit changes made to the field.
      </div>
    </Form>
  );
}
