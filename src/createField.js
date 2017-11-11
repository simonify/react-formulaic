import React from 'react';
import PropTypes from 'prop-types';

export default function createField(formInstance) {
  function Field({
    type: FieldType,
    disabled: baseDisabled,
    field,
    ...props
  }) {
    const disabled = baseDisabled == null
      ? formInstance.state.isCommitting && formInstance.state.preventChangeDuringCommit
      : baseDisabled;

    const spreadProps = typeof FieldType === 'function' ? ({
      isCommitting: formInstance.state.isCommitting,
      isDirty: formInstance.state.dirtyFields[field] || false,
      isInvalid: !!formInstance.state.invalidFields[field],
    }) : undefined;

    return (
      <FieldType
        key={field}
        disabled={disabled}
        onChange={event => formInstance.setValue(field, event.target.value)}
        value={formInstance.getValueForKey(field) || ''}
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
