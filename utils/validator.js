function sanitize(input) {
  return input.toString().replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

function validatePIN(pin) {
  return /^\d{4}$/.test(pin);
}

function validateAccountNumber(acct) {
  return /^\d{6,12}$/.test(acct);
}

module.exports = { sanitize, validatePIN, validateAccountNumber };
