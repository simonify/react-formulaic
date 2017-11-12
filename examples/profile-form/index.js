import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import {
  CommitButton,
  CancelButton,
  DirtyField,
  Field,
  FieldErrors,
  FormState,
  StatefulForm,
} from '../../src';
import { formStyle, inputStyle, rowStyle } from './shared';
import Button from './button';
import Committing from './committing';
import profileFormConfig from './profileFormConfig';

const WrappedField = ({ isCommitting, isDirty, isInvalid, ...props }) => (
  <input {...props} style={inputStyle({ isInvalid })} />
);

WrappedField.propTypes = {
  isCommitting: PropTypes.bool.isRequired,
  isDirty: PropTypes.bool.isRequired,
  isInvalid: PropTypes.bool.isRequired,
};

function Row({
  children,
  field,
  label,
}) {
  return (
    <div key={field} style={rowStyle}>
      <label>
        <DirtyField field={field}>
          {isDirty => (
            <div style={{ paddingBottom: 5, fontSize: 19, fontWeight: 500 }}>
              {label} {isDirty && '(edited)'}
            </div>
          )}
        </DirtyField>
        {cloneElement(children, { field })}
      </label>
      <FieldErrors field={field} />
    </div>
  );
}

Row.propTypes = {
  children: PropTypes.node.isRequired,
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default function Profile(props) {
  return (
    <StatefulForm {...profileFormConfig(props)} style={formStyle}>
      <h1>Edit Profile</h1>
      <Row label="Name" field="name">
        <Field type={WrappedField} />
      </Row>
      <Row label="Age" field="age">
        <Field type={WrappedField} />
      </Row>
      <Row label="State" field="state">
        <Field type="select">
          <option value="NC">NC</option>
          <option value="CA">CA</option>
          <option value="TX">TX</option>
          <option value="NY">NY</option>
        </Field>
      </Row>
      <Row label="City" field="city">
        <Field type={WrappedField} />
      </Row>
      <Row label="Email" field="email">
        <Field type={WrappedField} />
      </Row>
      <div>
        <CommitButton
          component={({ commit, isCommitting, ...rest }) => (
            <Button {...rest} onClick={commit}>
              {isCommitting ? 'Saving...' : 'Save'}
            </Button>
          )}
          type="submit"
        />
        <CancelButton
          component={({ cancel, ...rest }) => (
            <Button {...rest} onClick={cancel} />
          )}
          type="button"
        >
          Cancel
        </CancelButton>
      </div>
      <FormState>
        {({ isCommitting }) => (isCommitting ? <Committing /> : null)}
      </FormState>
    </StatefulForm>
  );
}

Profile.propTypes = {
  age: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};
