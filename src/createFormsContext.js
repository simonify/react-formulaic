import createDispatcher from 'create-dispatcher';

export default function createFormsContext() {
  const context = new Map();
  const { dispatch, subscribe } = createDispatcher();

  context.subscribe = subscribe;

  ['set', 'delete'].forEach((key) => {
    const fn = context[key];

    context[key] = (...args) => {
      const res = fn.apply(context, args);
      dispatch();
      return res;
    };
  });

  return context;
}
