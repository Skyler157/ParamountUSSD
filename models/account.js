const api = require('../services/paramountService');

// --- Check Balance ---
async function checkBalance(accountNumber) {
  try {
    const response = await api.post('/api/elmacore/bankwebservice/checkbalance', {
      accountNumber,
    });
    return response.data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking balance:`, error.response?.data || error.message);
    throw error;
  }
}

// --- Transfer Money ---
async function transferMoney(senderAccount, recipientAccount, amount) {
  try {
    const response = await api.post('/api/elmacore/bankwebservice/transfer', {
      senderAccount,
      recipientAccount,
      amount,
    });
    return response.data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error transferring money:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { checkBalance, transferMoney };