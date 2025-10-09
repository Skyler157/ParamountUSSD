require('dotenv').config();
const httpClient = require('../httpClient');

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'T': process.env.PARAMOUNT_TOKEN,
};

const ROUTES = {
  auth: process.env.PARAMOUNT_AUTH_URL,
  bank: process.env.PARAMOUNT_BANK_URL,
  purchase: process.env.PARAMOUNT_PURCHASE_URL,
  validate: process.env.PARAMOUNT_VALIDATE_URL,
};

// Authenticate user
async function authenticateUser(payload) {
  try {
    console.log('Auth payload', payload);
    const res = await httpClient.post(ROUTES.auth, payload, {
      headers: BASE_HEADERS
    });
    console.log('Auth success', res.data);
    return res.data;
  } catch (err) {
    console.error('Auth error:', err.message);
    return null;
  }
}

// Check account balance 
async function getBalance(payload) {
  try {
    const res = await httpClient.post(ROUTES.bank, payload, {
      headers: BASE_HEADERS
    });
    return res.data;
  } catch (err) {
    console.error('Bank error:', err.message);
    return null;
  }
}

// Validate bill or transfer
async function validateTransaction(payload) {
  try {
    const res = await httpClient.post(ROUTES.validate, payload, {
      headers: BASE_HEADERS
    });
    return res.data;
  } catch (err) {
    console.error('Validate error:', err.message);
    return null;
  }
}

// Purchase or pay bill
async function makePurchase(payload) {
  try {
    const res = await httpClient.post(ROUTES.purchase, payload, {
      headers: BASE_HEADERS
    });
    return res.data;
  } catch (err) {
    console.error('Purchase error:', err.message);
    return null;
  }
}

module.exports = {
  authenticateUser,
  getBalance,
  validateTransaction,
  makePurchase,
};
