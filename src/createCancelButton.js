import React from 'react';
import PropTypes from 'prop-types';

export default function createCancelButton(getFormState) {
  function onClick(event) {
    event.preventDefault();
    getFormState().cancel();
  }

  function CancelButton({ component: Component, children, ...props }) {
    const formState = getFormState();
    const disabled = !formState.isDirty || formState.isCommitting;

    if (Component === 'button') {
      return (
        <button
          {...props}
          disabled={disabled}
          type="button"
          onClick={onClick}
        >
          {typeof children === 'function' ? children({ ...formState, disabled }) : children}
        </button>
      );
    }

    const spreadProps = typeof Component === 'function' ? ({
      cancel: formState.cancel,
      disabled,
    }) : undefined;

    return (
      <Component {...props} {...spreadProps}>
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
