const bcrypt = require('bcryptjs');
const { pool, poolConnect, sql } = require('../config/db');
const { sanitize, validatePIN, validateAccountNumber } = require('../utils/validator');

// Register a new user
async function registerUser(name, accountNumber, msisdn, pin) {
  try {
    await poolConnect; 

    name = sanitize(name);
    accountNumber = sanitize(accountNumber);
    msisdn = sanitize(msisdn);
    pin = sanitize(pin);

    if (!validateAccountNumber(accountNumber) || !validatePIN(pin)) {
      console.warn(`[${new Date().toISOString()}] Invalid account or PIN format`);
      return false;
    }

    const checkQuery = `
      SELECT COUNT(*) AS count 
      FROM Users 
      WHERE AccountNumber = @accountNumber OR MSISDN = @msisdn
    `;
    const checkResult = await pool.request()
      .input('accountNumber', sql.VarChar(12), accountNumber)
      .input('msisdn', sql.VarChar(20), msisdn)
      .query(checkQuery);

    if (checkResult.recordset[0].count > 0) {
      console.warn(`[${new Date().toISOString()}] User already exists`);
      return false;
    }

    const pinHash = await bcrypt.hash(pin, 10);

    const insertQuery = `
      INSERT INTO Users (Name, AccountNumber, MSISDN, PinHash)
      VALUES (@name, @accountNumber, @msisdn, @pinHash)
    `;
    await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('accountNumber', sql.VarChar(12), accountNumber)
      .input('msisdn', sql.VarChar(20), msisdn)
      .input('pinHash', sql.VarChar(255), pinHash)
      .query(insertQuery);

    console.log(`[${new Date().toISOString()}] User registered successfully`);
    return true;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error registering user:`, err.message);
    return false;
  }
}

// Login user
async function loginUser(accountNumber, pin) {
  try {
    await poolConnect;

    accountNumber = sanitize(accountNumber);
    pin = sanitize(pin);

    const result = await pool.request()
      .input('accountNumber', sql.VarChar(12), accountNumber)
      .query('SELECT * FROM Users WHERE AccountNumber = @accountNumber');

    const user = result.recordset[0];
    if (!user) return null;

    const isMatch = await bcrypt.compare(pin, user.PinHash);
    if (!isMatch) return null;

    console.log(`[${new Date().toISOString()}] User login successful`);
    return user;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error logging in:`, err.message);
    return null;
  }
}

module.exports = { registerUser, loginUser };
