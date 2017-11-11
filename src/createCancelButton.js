import React from 'react';
import PropTypes from 'prop-types';

export default function createCancelButton(formInstance) {
  function onClick(event) {
    event.preventDefault();
    formInstance.cancel();
  }

  function CancelButton({ component: Component, children, ...props }) {
    const api = {
      isCommitting: formInstance.state.isCommitting,
      isDirty: formInstance.state.isDirty,
      isInvalid: formInstance.state.isInvalid,
      cancel: formInstance.cancel,
    };

    if (Component === 'button') {
      return (
        <button
          {...props}
          disabled={(!api.isDirty && !api.isInvalid) || api.isCommitting}
          type="button"
          onClick={onClick}
        >
          {typeof children === 'function' ? children(api) : children}
        </button>
      );
    }

    return (
      <Component {...props} {...api}>
        {children}
      </Component>
    );
  }

  CancelButton.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
  };

  CancelButton.defaultProps = {
    children: undefined,
    component: 'button',
  };

  return CancelButton;
}
