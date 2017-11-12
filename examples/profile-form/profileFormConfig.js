import { validation } from '../../src';

export default props => ({
  schema: {
    name: validation.first(
      validation.string,
      validation.reason(
        value => value.split(' ').length === 2,
        value => (
          `Please provide a first and last name${value.split(' ').length > 2 ? ' only' : ''}.`
        ),
      ),
    ),
    age: validation.all(
      validation.number,
      validation.reason(
        validation.all(
          validation.number.gte(18),
          validation.number.lte(90),
        ),
        'Please provide an age between 18-90',
      ),
    ),
    email: validation.all(
      validation.string,
      validation.reason(
        validation.string.email,
        'Please provide a valid email.',
      ),
      validation.reason(
        value => /gmail\.com$/.test(value) === false,
        'Please do not use a gmail email.',
      ),
    ),
  },

  initialValues: {
    age: props.age,
    name: props.name,
    state: props.state || 'CA',
  },

  getNormalizedValueForKey: {
    age: (value, prevValue) => (/^[0-9]*$/.test(value) ? value : prevValue),
  },

  onCommit: () => new Promise(resolve => setTimeout(resolve, 1000)),
});
