function sanitize(input) {
  if (typeof input !== 'string') input = input.toString();
  return input.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

function validatePIN(pin) {
  return /^\d{4}$/.test(pin); 
}

function validateAccountNumber(acct) {
  return /^\d{6,12}$/.test(acct); 
}

function validateName(name) {
  return /^[a-zA-Z\s]{2,50}$/.test(name); 
}

module.exports = { sanitize, validatePIN, validateAccountNumber, validateName };