export default function FieldsError(message, fields) {
  this.name = 'FieldsError';
  this.message = message;
  this.fields = fields;
  this.stack = (new Error()).stack;
}

FieldsError.prototype = new Error();
