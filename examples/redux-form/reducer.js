import { SET_IS_COMMITTING, UPDATE_FORM_FIELDS } from './shared';

const initialState = {
  form: {
    isCommitting: false,
    name: 'Simon Fletcher',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_IS_COMMITTING:
      return {
        ...state,
        form: {
          ...state.form,
          isCommitting: action.payload,
        },
      };
    case UPDATE_FORM_FIELDS:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}
