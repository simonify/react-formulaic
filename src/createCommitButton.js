import React from 'react';
import PropTypes from 'prop-types';

export default function createCommitButton(getFormState) {
  function CommitButton({ component: Component, children, ...props }) {
    const formState = getFormState();
    const disabled = (
      formState.isCommitting ||
      formState.isInvalid ||
      !formState.isDirty
    );

    if (Component === 'button') {
      return (
        <button {...props} disabled={disabled} type="submit">
          {typeof children === 'function' ? children({ ...formState, disabled }) : children}
        </button>
      );
    }

    const spreadProps = typeof Component === 'function' ? ({
      commit: formState.commit,
      disabled,
    }) : undefined;

    return (
      <Component {...props} {...spreadProps}>
        {children}
      </Component>
    );
  }

  CommitButton.propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.node,
    ]),
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
  };

  CommitButton.defaultProps = {
    children: undefined,
    component: 'button',
  };

  return CommitButton;
}
