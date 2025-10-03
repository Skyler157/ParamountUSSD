const { validatePIN, validateAccountNumber, sanitize } = require('../utils/validator');

let users = []; // In-memory users; replace with DB for production

async function registerUser(name, account, pin) {
  name = sanitize(name);
  account = sanitize(account);
  pin = sanitize(pin);

  if (!validateAccountNumber(account) || !validatePIN(pin)) return false;
  if (users.find(u => u.account === account)) return false;

  users.push({ name, account, pin });
  return true;
}

async function loginUser(account, pin) {
  account = sanitize(account);
  pin = sanitize(pin);

  return users.find(u => u.account === account && u.pin === pin) || null;
}

module.exports = { registerUser, loginUser };
