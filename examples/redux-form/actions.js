import { SET_IS_COMMITTING, UPDATE_FORM_FIELDS } from './shared';

export const setIsCommitting = isCommitting => ({
  type: SET_IS_COMMITTING,
  payload: isCommitting,
});

export const updateFormFields = fields => ({
  type: UPDATE_FORM_FIELDS,
  payload: fields,
});
