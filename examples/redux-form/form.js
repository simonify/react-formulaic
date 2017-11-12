import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CancelButton, CommitButton, Field, FormState } from '../../src';

export default class ExampleForm extends Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired,
    storeState: PropTypes.object.isRequired,
    setIsCommitting: PropTypes.func,
    updateFormFields: PropTypes.func,
    id: PropTypes.string,
  };

  static defaultProps = {
    id: null,
    setIsCommitting: null,
    updateFormFields: null,
  };

  onChangeState = (prevState, state) => {
    // keep a global copy of the form's commiting state
    if (prevState.isCommitting !== state.isCommitting) {
      this.props.setIsCommitting(state.isCommitting);
    }
  };

  onCommit = changes => new Promise((resolve, reject) => (
    // fake network delay
    setTimeout(() => {
      if (changes.name.toLowerCase() === 'trump') {
        reject(new Error('Name banned.'));
      } else {
        resolve();
      }

      if (this.props.updateFormFields) {
        this.props.updateFormFields(changes);
      }
    }, 2500)
  ));

  render() {
    const { component: FormComponent, id, initialValues, storeState } = this.props;

    return (
      <div>
        <FormComponent
          id={id}
          initialValues={initialValues}
          onCommit={this.onCommit}
          onChangeState={this.props.setIsCommitting ? this.onChangeState : undefined}
          style={{
            borderRadius: 8,
            marginBottom: 20,
            padding: 15,
            boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.05)',
          }}
          preventChangeWhenCommitting
          overwriteWhenInitialValuesChange
        >
          <div>Name (enter "trump" to simulate error):</div>
          <Field field="name" />{' '}
          <CommitButton>
            {({ isCommitting }) => (isCommitting ? 'Saving...' : 'Save changes')}
          </CommitButton>{' '}
          <CancelButton>
            Cancel
          </CancelButton>
          <FormState>
            {({ commitError }) => (commitError ? (
              <div
                style={{
                  marginTop: 15,
                  padding: '8px 14px',
                  background: '#ffefef',
                  borderRadius: 8,
                  boxShadow: '0 3px 8px #ffefef',
                }}
              >
                {commitError.message}
              </div>
            ) : null)}
          </FormState>
        </FormComponent>
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
