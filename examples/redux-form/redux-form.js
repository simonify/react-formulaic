/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import { name } from 'faker';
import { combineReducers } from 'redux';
import ReduxForm, { actions, reducer } from '../../src/redux';
import createStore from './createStore';
import ExampleForm from './form';

class ReduxFormExample extends Component {
  static propTypes = {
    storeState: PropTypes.object.isRequired,
    updateFields: PropTypes.func.isRequired,
  };

  updateName = () => this.props.updateFields('example', {
    name: name.findName(),
  });

  render() {
    return (
      <div style={{ padding: 25 }}>
        <ExampleForm
          component={ReduxForm}
          id="example"
          initialValues={{ name: 'Simon' }}
          storeState={this.props.storeState}
        />
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
    );
  }
}

const ReduxFormExampleContainer = connect(state => ({
  storeState: state,
}), actions)(ReduxFormExample);

export default class StoreProvider extends Component {
  static propTypes = {
    onDispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.store = createStore(combineReducers({ forms: reducer }));

    const { dispatch } = this.store;

    this.store.dispatch = (action) => {
      this.props.onDispatch(action);
      return dispatch(action);
    };
  }

  render() {
    return (
      <Provider store={this.store}>
        <ReduxFormExampleContainer />
      </Provider>
    );
  }
}
