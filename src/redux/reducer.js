import {
  DESTROY_FORM,
  INITIALIZE_FORM,
  UPDATE_FORM_FIELDS,
  UPDATE_FORM_STATE,
} from './constants';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case INITIALIZE_FORM:
      return {
        ...state,
        [action.payload.formId]: action.payload.initialState,
      };
    case UPDATE_FORM_FIELDS:
      return {
        ...state,
        [action.payload.formId]: (
          Object.entries(action.payload.fields).reduce((formState, [key, newValue]) => {
            if (
              action.payload.ignoreDirty ||
              formState.values[key] === formState.initialValues[key]
            ) {
              formState.values[key] = newValue; // eslint-disable-line
            }

            formState.initialValues[key] = newValue; // eslint-disable-line

            return formState;
          }, {
            ...state[action.payload.formId],
            initialValues: {
              ...state[action.payload.formId].initialValues,
            },
            values: {
              ...state[action.payload.formId].values,
            },
          })
        ),
      };
    case UPDATE_FORM_STATE:
      return {
        ...state,
        [action.payload.formId]: {
          ...state[action.payload.formId],
          ...action.payload.newState,
        },
      };
    case DESTROY_FORM:
      return Object.entries(state).reduce((newState, [id, formState]) => {
        if (id !== action.payload) {
          return Object.assign(newState, {
            [id]: formState,
          });
        }

        return newState;
      }, {});
    default:
      return state;
  }
}
