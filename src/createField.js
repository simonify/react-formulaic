import React from 'react';
import PropTypes from 'prop-types';

export default function createField(getFormState) {
  function Field({
    type: FieldType,
    disabled: baseDisabled,
    field,
    ...props
  }) {
    const formState = getFormState();
    const disabled = baseDisabled == null
      ? formState.isCommitting && formState.preventChangeWhenCommitting
      : baseDisabled;

    const spreadProps = typeof FieldType === 'function' ? ({
      isCommitting: formState.isCommitting,
      isDirty: formState.dirtyFields[field] || false,
      isInvalid: !!formState.invalidFields[field],
    }) : undefined;

    return (
      <FieldType
        key={field}
        disabled={disabled}
        onChange={event => formState.setValue(field, event.target.value)}
        onFocus={() => {
          formState.onFocusField(field);
        }}
        onBlur={() => {
          formState.onBlurField(field);
          formState.onTouchField(field);
        }}
        value={formState.getValueForKey(field) || ''}
        {...props}
        {...spreadProps}
      />
    );
  }

  Field.propTypes = {
    field: PropTypes.string.isRequired,
    type: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.oneOf([
        'input',
        'select',
        'textarea',
      ]),
    ]),
    disabled: PropTypes.bool,
  };

  Field.defaultProps = {
    disabled: undefined,
    type: 'input',
  };

  return Field;
}
