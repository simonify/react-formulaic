import {
  DESTROY_FORM,
  INITIALIZE_FORM,
  UPDATE_FORM_FIELDS,
  UPDATE_FORM_STATE,
} from './constants';

export const initializeForm = (formId, initialState) => ({
  type: INITIALIZE_FORM,
  payload: { formId, initialState },
});

export const updateFormState = (formId, newState) => ({
  type: UPDATE_FORM_STATE,
  payload: { formId, newState },
});

export const destroyForm = formId => ({
  type: DESTROY_FORM,
  payload: formId,
});

export const updateFields = (formId, fields, ignoreDirty) => ({
  type: UPDATE_FORM_FIELDS,
  payload: { formId, fields, ignoreDirty },
});
