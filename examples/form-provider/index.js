import React from 'react';
import { Field, Form, FormsContext, FormProvider } from '../../src';
import * as styles from './styles';

const onCommit = () => {};

export default function FormProviderExample() {
  return (
    <FormsContext>
      <div style={{ padding: 25 }}>
        <div
          style={{
            marginBottom: 25,
            paddingBottom: 25,
            borderBottom: '1px solid #eee',
            fontSize: 17,
            lineHeight: '28px',
          }}
        >
          You can wrap your application in a <code>&lt;FormsContext /&gt;</code> and
          provide a custom id to your <code>&lt;Form /&gt;</code> to use{' '}
          <code>&lt;Field /&gt;</code> anywhere in the component tree.
        </div>
        <div style={styles.label}>
          {'<FormsContext />'}
        </div>
        <FormProvider id="example">
          <div style={styles.section}>
            <div style={styles.label}>
              {'<FormProvider id="example" />'}
            </div>
            <div>
              <Field field="message" style={styles.textarea} type="textarea" />
            </div>
          </div>
        </FormProvider>
        <Form
          id="example"
          initialValues={{
            message: 'hello world',
          }}
          onCommit={onCommit}
          style={styles.section}
          preventChangeWhenCommitting
        >
          <div style={styles.label}>
            {'<Form id="example" />'}
          </div>
          <div>
            <Field field="message" style={styles.textarea} type="textarea" />
          </div>
        </Form>
      </div>
    </FormsContext>
  );
}
