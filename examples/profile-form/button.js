import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ disabled, type, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        marginRight: 15,
        padding: '8px 12px',
        background: type === 'submit' ? 'black' : 'white',
        border: 0,
        borderRadius: 30,
        fontSize: 21,
        color: type === 'submit' ? 'white' : 'black',
        opacity: disabled ? 0.25 : 1,
      }}
      type={type}
    />
  );
}

Button.propTypes = {
  disabled: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
};
