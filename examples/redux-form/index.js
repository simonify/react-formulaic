import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { name } from 'faker';
import createStore from './createStore';
import ExampleForm from './form';
import * as actions from './actions';

const ExampleFormContainer = connect(state => ({
  initialValues: { name: state.form.name },
  storeState: state,
}), actions)(ExampleForm);

export default class ReduxForm extends Component {
  static propTypes = {
    onDispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.store = createStore();

    const { dispatch } = this.store;

    this.store.dispatch = (action) => {
      this.props.onDispatch(action);
      return dispatch(action);
    };
  }

  updateName = () => this.store.dispatch(actions.updateFormFields({
    name: name.findName(),
  }));

  render() {
    return (
      <Provider store={this.store}>
        <div style={{ padding: 25 }}>
          <ExampleFormContainer />
          <div style={{ marginTop: 25 }}>
            <button
              onClick={this.updateName}
              style={{
                padding: 12,
                border: 0,
                borderRadius: 30,
                background: '#000000',
                fontSize: 19,
                color: 'white',
                outline: 0,
              }}
            >
              Click here to update the field value, outside of the createForm() context.
            </button>
            <div style={{ marginTop: 25 }}>
              The input’s value will only update if the field is not dirty.
            </div>
          </div>
        </div>
      </Provider>
    );
  }
}
