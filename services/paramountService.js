require('dotenv').config();
const httpClient = require('../httpClient');
const logger = require('../utils/logger');

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

function redactSensitive(payload) {
  const copy = JSON.parse(JSON.stringify(payload));
  if (copy.EncryptedFields?.PIN) copy.EncryptedFields.PIN = '***';
  if (copy.EncryptedFields?.KEY) copy.EncryptedFields.KEY = '***';
  return copy;
}

async function authenticateUser(payload) {
  try {
    console.log('[Auth] payload:', JSON.stringify(redactSensitive(payload)));
    const res = await httpClient.post(ROUTES.auth, payload, { headers: BASE_HEADERS });
    console.log('[Auth] response:', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.error('[Auth] error:', err.message);
    return null;
  }
}

async function getBalance(payload) {
  try {
    const res = await httpClient.post(ROUTES.bank, payload, { headers: BASE_HEADERS });
    return res.data;
  } catch (err) {
    logger.error(`[Bank] error: ${err.message}`);
    return null;
  }
}

async function validateTransaction(payload) {
  try {
    const res = await httpClient.post(ROUTES.validate, payload, { headers: BASE_HEADERS });
    return res.data;
  } catch (err) {
    logger.error(`[Validate] error: ${err.message}`);
    return null;
  }
}

async function makePurchase(payload) {
  try {
    logger.info(`[Purchase] payload: ${JSON.stringify(redactSensitive(payload))}`);
    const res = await httpClient.post(ROUTES.purchase, payload, { headers: BASE_HEADERS });
    logger.info(`[Purchase] response: ${JSON.stringify(res.data)}`);
    return res.data;
  } catch (err) {
    logger.error(`[Purchase] error: ${err.message}`);
    return null;
  }
}

module.exports = {
  authenticateUser,
  getBalance,
  validateTransaction,
  makePurchase
};
