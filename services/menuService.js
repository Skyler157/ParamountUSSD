const { con, end } = require('../utils/responseHelper');
const { logStep } = require('./sessionService');
const { registerUser, loginUser } = require('../models/user');
const { 
  checkBalance, 
  getMiniStatement,
  sendMobileMoney,
  buyAirtime,
  fundsTransfer,
  payBill,
  payMerchant,
  changePIN
} = require('../models/account');
const { sanitize } = require('../utils/validator');

async function handleMenu(sessionId, text) {
  const textArray = text ? text.split('*') : [];
  let response = '';

  // --- Welcome Menu ---
  if (textArray.length === 0 || text === '') {
    logStep(sessionId, 'Menu shown: Welcome to Paramount Bank');
    response = con(`Welcome to Paramount Bank:
1. Register
2. Login
00. Exit`);
  }

  // --- Registration ---
  else if (textArray[0] === '1') {
    if (textArray.length === 1) response = con('Enter your full name:');
    else if (textArray.length === 2) response = con('Enter your account number:');
    else if (textArray.length === 3) response = con('Create a 4-digit PIN:');
    else if (textArray.length === 4) response = con('Confirm your PIN:');
    else if (textArray.length === 5) {
      const success = await registerUser(
        sanitize(textArray[1]),
        sanitize(textArray[2]),
        sanitize(textArray[3])
      );
      logStep(sessionId, success ? 'Registration successful' : 'Registration failed');
      response = success
        ? end('Registration successful! You can now login.')
        : end('Registration failed. Try again.');
    }
  }

  // --- Login ---
  else if (textArray[0] === '2') {
    // Ask for credentials
    if (textArray.length === 1) response = con('Enter your account number:');
    else if (textArray.length === 2) response = con('Enter your PIN:');

    // Process login
    else if (textArray.length === 3) {
      const user = await loginUser(sanitize(textArray[1]), sanitize(textArray[2]));
      if (!user) {
        logStep(sessionId, 'Login failed');
        response = end('Invalid login. Try again.');
      } else {
        logStep(sessionId, `Login successful: ${user.name}`);
        // Advanced post-login menu
        response = con(`Welcome ${user.name}!
1. My Account
2. Mobile Money
3. Airtime
4. Funds Transfer
5. Bill Payment
6. Pay Merchant
7. Change PIN
00. Exit`);
      }
    }

    // --- Advanced Menu Navigation ---
    else if (textArray.length >= 4) {
      const mainChoice = textArray[3];
      const subChoice = textArray[4] || '';
      const step = textArray[5] || '';

      switch(mainChoice) {

        // --- My Account ---
        case '1':
          if (!subChoice) response = con(`My Account:
1. Balance
2. Mini Statement
0. Back`);
          else if (subChoice === '1') {
            if (!step) response = con('Select your account:');
            else if (step === '1') {
              const balance = checkBalance(textArray[1]);
              logStep(sessionId, `Balance checked: KES ${balance}`);
              response = end(`Your balance is KES ${balance}`);
            }
          }
          else if (subChoice === '2') {
            if (!step) response = con('Select your account for mini statement:');
            else if (step === '1') {
              const statement = getMiniStatement(textArray[1]);
              response = end(`Mini Statement:\n${statement}`);
            }
          }
          break;

        // --- Mobile Money ---
        case '2':
          if (!subChoice) response = con(`Mobile Money:
1. Send to own M-PESA
2. Send to other M-PESA
0. Back`);
          else if (subChoice === '1') {
            if (!step) response = con('Enter amount:');
            else if (step === '1') response = con('Select source account:');
            else if (step === '2') response = con('Enter PIN to confirm:');
            else if (step === '3') {
              const success = sendMobileMoney(textArray[1], textArray[4], textArray[5]);
              response = success
                ? end('Mobile money transfer successful!')
                : end('Transfer failed.');
            }
          }
          else if (subChoice === '2') {
            if (!step) response = con('Enter recipient mobile number:');
            else if (step === '1') response = con('Enter amount:');
            else if (step === '2') response = con('Select source account:');
            else if (step === '3') response = con('Enter PIN to confirm:');
            else if (step === '4') {
              const success = sendMobileMoney(textArray[1], textArray[4], textArray[5]);
              response = success
                ? end('Mobile money transfer successful!')
                : end('Transfer failed.');
            }
          }
          break;

        // --- Airtime ---
        case '3':
          if (!subChoice) response = con(`Airtime:
1. Buy for own number
2. Buy for other number
0. Back`);
          else if (subChoice === '1') {
            if (!step) response = con('Enter amount:');
            else if (step === '1') response = con('Select source account:');
            else if (step === '2') response = con('Enter PIN to confirm:');
            else if (step === '3') {
              const success = buyAirtime(textArray[1], textArray[4]);
              response = success ? end('Airtime purchase successful!') : end('Purchase failed.');
            }
          }
          else if (subChoice === '2') {
            if (!step) response = con('Enter recipient mobile number:');
            else if (step === '1') response = con('Enter amount:');
            else if (step === '2') response = con('Select source account:');
            else if (step === '3') response = con('Enter PIN to confirm:');
            else if (step === '4') {
              const success = buyAirtime(textArray[1], textArray[4]);
              response = success ? end('Airtime purchase successful!') : end('Purchase failed.');
            }
          }
          break;

        // --- Funds Transfer ---
        case '4':
          if (!subChoice) response = con(`Funds Transfer:
1. To own account
2. To other account
0. Back`);
          else if (subChoice === '1') {
            // steps: select A/C to credit -> amount -> source A/C -> remark -> PIN
            if (!step) response = con('Select account to credit:');
            else if (step === '1') response = con('Enter amount:');
            else if (step === '2') response = con('Select source account:');
            else if (step === '3') response = con('Enter remark:');
            else if (step === '4') response = con('Enter PIN to confirm:');
            else if (step === '5') {
              const success = fundsTransfer(textArray[1], textArray[4], textArray[5], textArray[6], textArray[7]);
              response = success ? end('Transfer successful!') : end('Transfer failed.');
            }
          }
          else if (subChoice === '2') {
            if (!step) response = con('Enter recipient account:');
            else if (step === '1') response = con('Enter amount:');
            else if (step === '2') response = con('Select source account:');
            else if (step === '3') response = con('Enter remark:');
            else if (step === '4') response = con('Enter PIN to confirm:');
            else if (step === '5') {
              const success = fundsTransfer(textArray[1], textArray[4], textArray[5], textArray[6], textArray[7]);
              response = success ? end('Transfer successful!') : end('Transfer failed.');
            }
          }
          break;

        // --- Bill Payment ---
        case '5':
          if (!subChoice) response = con(`Bill Payment:
1. DStv
2. GOtv
3. Zuku
4. StarTimes
5. Nairobi Water
6. JTL
0. Back`);
          else if (['1','2','3','4','5','6'].includes(subChoice)) {
            if (!step) response = con('Enter account number:');
            else if (step === '1') response = con('Enter amount:');
            else if (step === '2') response = con('Select source account:');
            else if (step === '3') response = con('Enter PIN to confirm:');
            else if (step === '4') {
              const success = payBill(textArray[1], textArray[3], textArray[4]);
              response = success ? end('Bill payment successful!') : end('Payment failed.');
            }
          }
          break;

        // --- Pay Merchant ---
        case '6':
          if (!subChoice) response = con('Enter merchant code:');
          else if (subChoice === '1') response = con('Confirm merchant details:');
          else if (subChoice === '2') response = con('Enter amount:');
          else if (subChoice === '3') response = con('Select source account:');
          else if (subChoice === '4') response = con('Enter PIN to confirm:');
          else if (subChoice === '5') {
            const success = payMerchant(textArray[1], textArray[4]);
            response = success ? end('Merchant payment successful!') : end('Payment failed.');
          }
          break;

        // --- Change PIN ---
        case '7':
          if (!subChoice) response = con('Enter old PIN:');
          else if (subChoice === '1') response = con('Enter new PIN:');
          else if (subChoice === '2') response = con('Re-enter new PIN:');
          else if (subChoice === '3') {
            const success = changePIN(textArray[1], textArray[4], textArray[5]);
            response = success ? end('PIN changed successfully!') : end('Failed to change PIN.');
          }
          break;

        // --- Exit ---
        case '00':
          logStep(sessionId, 'User exited');
          response = end('Thank you for using Paramount Bank.');
          break;

        default:
          response = end('Invalid input');
      }
    }
  }

  // --- Exit ---
  else if (textArray[0] === '00') {
    logStep(sessionId, 'User exited');
    response = end('Thank you for using Paramount Bank.');
  }

  else response = end('Invalid input');

  return response;
}

module.exports = { handleMenu };
