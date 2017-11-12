export const string = value => typeof value === 'string';
export const number = value => Number(value) == value; // eslint-disable-line eqeqeq
export const int = value => Number(value) === value && value % 1 === 0;
export const float = value => Number(value) === value && value % 1 !== 0;
export const length = (min, max) => value => value.length >= min && value.length <= max;

number.between = (min, max) => value => value >= min && value <= max;
number.gte = min => value => value >= min;
number.gt = min => value => value > min;
number.lte = max => value => value <= max;
number.lt = max => value => value < max;

string.email = value => /^(.+)@[a-zA-Z0-9-]{1,}\.[a-zA-Z]{2,}$/.test(value);
string.len = {
  gte: min => value => string(value) && value.length >= min,
  gt: min => value => string(value) && value.length > min,
  lte: max => value => string(value) && value.length <= max,
  lt: max => value => string(value) && value.length < max,
};

export const first = (...rules) => value => rules.reduce((failure, rule) => {
  if (failure !== true) {
    return failure;
  }

  return rule(value);
}, true);

export const all = (...rules) => (value) => {
  let failures = rules.map(rule => rule(value)).filter(validate => validate !== true);

  if (!failures.length) {
    return true;
  }

  failures = failures.filter(failure => failure !== false);

  if (!failures.length) {
    return false;
  }

  return failures;
};

export const reason = (fn, validationReason) => (value) => {
  const res = fn(value);

  if (res === true) {
    return true;
  }

  if (typeof validationReason === 'function') {
    return validationReason(value);
  }

  return validationReason;
};
