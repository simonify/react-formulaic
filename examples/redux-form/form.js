import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CancelButton, CommitButton, Field, Form } from '../../src';

export default class ExampleForm extends Component {
  static propTypes = {
    initialValues: PropTypes.object.isRequired,
    setIsCommitting: PropTypes.func.isRequired,
    storeState: PropTypes.object.isRequired,
    updateFormFields: PropTypes.func.isRequired,
  };

  onChangeState = (prevState, state) => {
    // keep a global copy of the form's commiting state
    if (prevState.isCommitting !== state.isCommitting) {
      this.props.setIsCommitting(state.isCommitting);
    }
  };

  onCommit = changes => new Promise(resolve => (
    // fake network delay
    setTimeout(() => {
      resolve();
      this.props.updateFormFields(changes);
    }, 2500)
  ));

  render() {
    const { initialValues, storeState } = this.props;

    return (
      <div>
        <Form
          initialValues={initialValues}
          onCommit={this.onCommit}
          // onChangeState={this.onChangeState}
          style={{
            borderRadius: 8,
            marginBottom: 20,
            padding: 15,
            boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.05)',
          }}
          preventChangeWhenCommitting
          overwriteWhenInitialValuesChange
        >
          <div>Name:</div>
          <Field field="name" />{' '}
          <CommitButton>
            {({ isCommitting }) => (isCommitting ? 'Saving...' : 'Save changes')}
          </CommitButton>{' '}
          <CancelButton>
            Cancel
          </CancelButton>
        </Form>
        <div style={{ marginTop: 25 }}>
          <strong>Redux store state:</strong>
          <pre style={{ padding: 12, borderRadius: 8 }}>
            {JSON.stringify(storeState, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
}
