import React from 'react';
import PropTypes from 'prop-types';

export default function createCommitButton(formInstance) {
  function CommitButton({ component: Component, children, ...props }) {
    const api = {
      isCommitting: formInstance.state.isCommitting,
      isDirty: formInstance.state.isDirty,
      isInvalid: formInstance.state.isInvalid,
      commit: formInstance.commit,
    };

    if (Component === 'button') {
      return (
        <button {...props} disabled={api.isCommitting || !api.isDirty || api.isInvalid} type="submit">
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
