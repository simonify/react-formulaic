export const inputStyle = ({ isInvalid }) => ({
  padding: 8,
  border: '1px solid',
  borderRadius: 4,
  outline: 0,
  background: isInvalid
    ? '#FFCECE'
    : '#FFFFFF',
  borderColor: isInvalid
    ? '#FFCECE'
    : '#EEEEEE',
});

export const rowStyle = {
  borderRadius: 8,
  marginBottom: 20,
  padding: 15,
  boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.05)',
};

export const formStyle = {
  position: 'relative',
  padding: '25px 50px',
};
