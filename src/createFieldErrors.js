import React from 'react';
import PropTypes from 'prop-types';
import { UNKNOWN_VALIDATION_FAILURE } from './constants';

export default function createFieldErrors(formInstance) {
  function FieldErrors({
    component: Component,
    field,
    renderError,
    ...props
  }) {
    const errors = field
      ? formInstance.state.invalidFields[field]
      : Object.values(formInstance.state.invalidFields).reduce((arr, arr2) => arr.concat(arr2), []);

    if (!errors) {
      return null;
    }

    return (
      <Component {...props}>
        {errors.map(renderError)}
      </Component>
    );
  }

  FieldErrors.propTypes = {
    component: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    field: PropTypes.string,
    renderError: PropTypes.func,
  };

  FieldErrors.defaultProps = {
    component: 'ul',
    field: null,
    renderError: (error, index) => (
      <li key={index}>
        {error === UNKNOWN_VALIDATION_FAILURE ? (
          'Invalid value.'
        ) : error}
      </li>
    ),
  };

  return FieldErrors;
}
