const { con, end } = require('../utils/responseHelper');
const { getSessionData, setSessionData, logStep } = require('./sessionService');
const { sanitize } = require('../utils/validator');
const paramountService = require('./paramountService');
const crypto = require('crypto');


async function handleMenu(sessionId, input) {
  const session = getSessionData(sessionId);
  if (!session) return end('Session expired. Please start again.');

  session.inputs.push(input);
  let response = '';

  const sensitiveSteps = [12,13,14,22,53,55,64,91,92];
  logStep(sessionId, `Step ${session.step} input=${input}`, sensitiveSteps.includes(session.step));

  switch (session.step) {

    // Welcome
    case 0:
      logStep(sessionId, 'Menu shown: Welcome to Paramount Bank');
      response = con(`Welcome to Paramount Bank:
1. Register
2. Login
00. Exit`);
      session.step = 1;
      break;

    case 1:
      if (input === '1') {
        session.step = 10;
        response = con('Enter your full name:');
      } else if (input === '2') {
        session.step = 22;
        response = con('Enter your PIN:');
      } else if (input === '00') {
        logStep(sessionId, 'User exited');
        response = end('Thank you for using Paramount Bank.');
        session.step = 0;
      } else {
        response = con('Invalid input. Please choose 1, 2, or 00:');
      }
      break;

    // Registration 
    case 10:
      session.tempName = sanitize(input);
      session.step = 11;
      response = con('Enter your mobile number:');
      break;
    case 11:
      session.tempMobile = sanitize(input);
      session.step = 12;
      response = con('Create a 4-digit PIN:');
      break;
    case 12:
      session.tempPIN = sanitize(input);
      session.step = 13;
      response = con('Confirm your PIN:');
      break;
    case 13:
      if (session.tempPIN !== sanitize(input)) {
        response = con('PINs do not match. Enter a 4-digit PIN:');
        session.step = 12;
      } else {
        const activationPayload = {
          FormID: "ACTIVATIONREQ",
          sessionID: sessionId,
          Country: "KENYATEST",
          BankID: "50",
          MobileNumber: "254705285825",
          trxSource: "USSD",
          IMEI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
          IMSI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
          UNIQUEID: crypto.randomUUID(),
          VersionNumber: "4.0",
          APPNAME: "PARAMOUNT",
          CODEBASE: "USSD",
          LATLON: "0,0",
          EncryptedFields: { PIN: session.tempPIN }
        };

        const result = await paramountService.authenticateUser(activationPayload);
        if (result && result.status === '000') {
          session.tempCustomerID = result.customerID; 
          session.step = 14;
          logStep(sessionId, `Activation code sent to ${session.tempMobile}`);
          response = con('Activation code sent to your mobile. Enter the 6-digit code:');
        } else {
          logStep(sessionId, 'Registration failed at activation request');
          response = end('Registration failed. Try again.');
          session.step = 0;
        }
      }
      break;
    case 14:
      session.activationCode = sanitize(input);
      const activatePayload = {
        FormID: "ACTIVATE",
        sessionID: sessionId,
        Country: "KENYATEST",
        BankID: "50",
        MobileNumber: "254705285825",
        CustomerID: "2001234567",
        trxSource: "USSD",
        IMEI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
        IMSI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
        UNIQUEID: crypto.randomUUID(),
        VersionNumber: "4.0",
        APPNAME: "PARAMOUNT",
        CODEBASE: "USSD",
        LATLON: "0,0",
        EncryptedFields: { KEY: session.activationCode }
      };

      const activateResult = await paramountService.authenticateUser(activatePayload);
      if (activateResult && activateResult.status === '000') {
        logStep(sessionId, 'Registration/Activation successful');
        response = end('Registration successful! You can now login.');
      } else {
        logStep(sessionId, 'Activation failed');
        response = end('Activation failed. Try again.');
      }
      session.step = 0;
      break;

    // --- Login ---
    case 22:
      const pin = sanitize(input);

      //LOGIN
      const authPayload = {
        FormID: "LOGIN",
        CustomerID: "2001234567",
        MobileNumber: "254705285825",
        EncryptedFields: { PIN: pin },
        sessionID: sessionId,
        UNIQUEID: crypto.randomUUID(),
        BankID: "50",
        Country: "KENYATEST",
        VersionNumber: "0.5.6",
        IMEI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
        IMSI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
        TRXSOURCE: "APP",
        APPNAME: "PARAMOUNT",
        CODEBASE: "ANDROID",
        LATLON: "-1.2612612612612613,36.765664336799624",
        AppNotificationID: "dPoY7lknTIOeLsbe7Spd5v:APA91bE-ZPCK6fYMzA1kKFouGzm3Sbl2cPjQ27TPHj7zQuD5IxhzQLb55qzGEnVy6L9PMkDlmuxA82_wYkG8Uy9ETAsIXYyB13Pz_PUPf_HXAhfriqhYxfY",
        Login: { LoginType: "PIN" }
      };

      const user = await paramountService.authenticateUser(authPayload);

      if (!user || user.Status !== '000') {
        logStep(sessionId, 'Login failed');
        response = end('Invalid login. Try again.');
        session.step = 0;
      } else {
        logStep(sessionId, `Login successful: ${user.FirstName} ${user.LastName}`);
        session.loggedIn = true;
        session.userName = `${user.FirstName} ${user.LastName}`;
        session.accountNumber = "2001234567";
        session.customerID = "2001234567";
        session.accounts = user.Accounts || [];
        session.step = 30;
        response = con(`Welcome ${user.FirstName} ${user.LastName}!
1. My Account
2. Airtime
3. Funds Transfer
4. Pay Merchant
5. Change PIN
00. Exit`);
      }
      break;

    //  Main Logged-In Menu
    case 30:
      switch (input) {
        case '1':
          session.prevStep = 30;
          session.step = 31;
          response = con(`My Account:
1. Balance
2. Mini Statement
0. Back`);
          break;
        case '2':
          session.prevStep = 30;
          session.step = 50;
          response = con(`Airtime:
1. Buy for own number
2. Buy for other number
0. Back`);
          break;
        case '3':
          session.prevStep = 30;
          session.step = 60;
          response = con(`Funds Transfer:
1. To own account
2. To other account
0. Back`);
          break;
        case '4':
          session.prevStep = 30;
          session.step = 80;
          response = con('Enter merchant code:');
          break;
        case '5':
          session.prevStep = 30;
          session.step = 90;
          response = con('Enter old PIN:');
          break;
        case '00':
          logStep(sessionId, 'User exited');
          response = end('Thank you for using Paramount Bank.');
          session.step = 0;
          break;
        default:
          response = con('Invalid input. Please choose an option from the menu:');
          break;
      }
      break;

    //  My Account submenu 
    case 31:
      if (input === '0') {
        session.step = 30;
        response = con(`Welcome ${session.userName}!
1. My Account
2. Airtime
3. Funds Transfer
4. Pay Merchant
5. Change PIN
00. Exit`);
      } else {
        // Call balance or mini statement
        const accountPayload = {
          FormID: "PAYBILL",
          SessionID: sessionId,
          UNIQUEID: crypto.randomUUID(),
          BankID: "50",
          Country: "KENYATEST",
          VersionNumber: "1.5.7",
          IMEI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
          IMSI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
          TRXSOURCE: "APP",
          APPNAME: "PARAMOUNT",
          CODEBASE: "ANDROID",
          CustomerID: "2001234567",
          LATLON: "-1.2648189,36.7632694",
          AppNotificationID: "dPoY7lknTIOeLsbe7Spd5v:APA91bE-ZPCK6fYMzA1kKFouGzm3Sbl2cPjQ27TPHj7zQuD5IxhzQLb55qzGEnVy6L9PMkDlmuxA82_wYkG8Uy9ETAsIXYyB13Pz_PUPf_HXAhfriqhYxfY",
          ModuleID: input === '1' ? "HOME" : "MINISTATEMENT",
          MerchantID: input === '1' ? "BALANCE" : "MINISTATEMENT",
          PayBill: {
            BANKACCOUNTID: input === '1' ? "010001100001" : "000002161002",
            MerchantID: input === '1' ? "BALANCE" : "MINISTATEMENT"
          }
        };

        const result = await paramountService.getBalance(accountPayload);
        if (result && (result.Status === '000' || result.status === '000')) {
          if (input === '1') {
            response = con(`Balance: ${result.accountBalance} KES
Available: ${result.availableBalance} KES
0. Back`);
          } else {
            let statementText = 'Mini Statement:\n';
            result.transactions.forEach(t => {
              statementText += `${t.particulars} | Debit: ${t.debit} | Credit: ${t.credit} | Balance: ${t.closingBalance}\n`;
            });
            statementText += '0. Back';
            response = con(statementText);
          }
        } else {
          response = con('Could not retrieve account info. Press 0 to go back.');
        }
      }
      break;


    // --- Airtime ---
    case 50:
      if (input === '0') {
        session.step = 30;
        response = con(`Welcome ${session.userName}!
1. My Account
2. Airtime
3. Funds Transfer
4. Pay Merchant
5. Change PIN
00. Exit`);
      } else if (input === '1') {
        session.step = 51;
        response = con('Enter amount:');
      } else if (input === '2') {
        session.step = 52;
        response = con('Enter phone number:');
      } else {
        response = con('Invalid. 1. Own, 2. Other, 0. Back');
      }
      break;
    case 51:
      session.airAmount = sanitize(input);
      session.step = 53;
      response = con('Enter PIN:');
      break;
    case 52:
      session.airRecipient = sanitize(input);
      session.step = 54;
      response = con('Enter amount:');
      break;
    case 54:
      session.airAmount = sanitize(input);
      session.step = 55;
      response = con('Enter PIN:');
      break;
    case 53:
    case 55:
      const airPIN = sanitize(input);
      const airPayload = {
        FormID: "PAYBILL",
        UNIQUEID: crypto.randomUUID(),
        SessionID: sessionId,
        CustomerID: "2001234567",
        BankID: "50",
        Country: "KENYATEST",
        VersionNumber: "225",
        IMEI: "678A8C34F8A352F1D8C916E7C27019DA",
        IMSI: "678A8C34F8A352F1D8C916E7C27019DA",
        TRXSOURCE: "APP",
        APPNAME: "PARAMOUNT",
        CODEBASE: "ANDROID",
        LATLON: "-1.2647723,36.7633848",
        ModuleID: "SAFARICOM",
        MerchantID: "CSSAFCOMKE",
        PayBill: {
          ACCOUNTID: session.airRecipient || "254705285825",
          AMOUNT: parseFloat(session.airAmount),
          BANKACCOUNTID: "010001100001",
          MerchantID: "CSSAFCOMKE"
        },
        EncryptedFields: { PIN: airPIN }
      };
      const airResult = await paramountService.makePurchase(airPayload);
      if (airResult && (airResult.Status === '000' || airResult.status === '000')) {
        response = con('Airtime purchase successful. Press 0 to go back.');
      } else {
        response = con('Failed. Press 0 to go back.');
      }
      session.step = 50;
      break;

    // Funds Transfer 
    case 60:
      if (input === '0') {
        session.step = 30;
        response = con(`Welcome ${session.userName}!
1. My Account
2. Airtime
3. Funds Transfer
4. Pay Merchant
5. Change PIN
00. Exit`);
      } else if (input === '1') {
        session.step = 61;
        response = con('Enter destination account number:');
      } else if (input === '2') {
        session.step = 62;
        response = con('Enter destination account number:');
      } else {
        response = con('Invalid. 1. Own, 2. Other, 0. Back');
      }
      break;
    case 61: 
      session.transDest = session.accounts[0]?.BankAccountID || session.accountNumber; 
      session.step = 63;
      response = con('Enter amount:');
      break;
    case 62:
      session.transDest = sanitize(input);
      session.step = 63;
      response = con('Enter amount:');
      break;
    case 63:
      session.transAmount = sanitize(input);
      session.step = 64;
      response = con('Enter PIN:');
      break;
    case 64:
      const transPIN = sanitize(input);
      const transferPayload = {
        FormID: "PAYBILL",
        UNIQUEID: crypto.randomUUID(),
        SessionID: sessionId,
        CustomerID: "2001234567",
        BankID: "50",
        Country: "KENYATEST",
        VersionNumber: "225",
        IMEI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
        IMSI: "JOeHs0RckvS/5tSPZI7s14vVzFhbMu9rRkmgTs3K+Fg=",
        TRXSOURCE: "APP",
        APPNAME: "PARAMOUNT",
        CODEBASE: "ANDROID",
        LATLON: "-1.2647723,36.7633848",
        AppNotificationID: "dPoY7lknTIOeLsbe7Spd5v:APA91bE-ZPCK6fYMzA1kKFouGzm3Sbl2cPjQ27TPHj7zQuD5IxhzQLb55qzGEnVy6L9PMkDlmuxA82_wYkG8Uy9ETAsIXYyB13Pz_PUPf_HXAhfriqhYxfY",
        MerchantID: "TRANSFER",
        ModuleID: "OWNTRANSFER",
        PayBill: {
          INFOFIELD9: true,
          BANKACCOUNTID: "010001100001",
          AMOUNT: parseFloat(session.transAmount),
          TRXDESCRIPTION: "Narration ",
          ACCOUNTID: "000002161002",
          MerchantID: "TRANSFER"
        },
        EncryptedFields: { PIN: transPIN }
      };
      const transResult = await paramountService.getBalance(transferPayload);
      if (transResult && (transResult.Status === '000' || transResult.status === '000')) {
        response = con('Transfer successful. Press 0 to go back.');
      } else {
        response = con('Failed. Press 0 to go back.');
      }
      session.step = 60;
      break;


    // Pay Merchant 
    case 80:
      if (input === '0') {
        session.step = 30;
        response = con(`Welcome ${session.userName}!
1. My Account
2. Airtime
3. Funds Transfer
4. Pay Merchant
5. Change PIN
00. Exit`);
      } else {
        session.merchantCode = sanitize(input);
        session.step = 81;
        response = con('Enter amount:');
      }
      break;
    case 81:
      session.merchAmount = sanitize(input);
      session.step = 82;
      response = con('Enter PIN:');
      break;
    case 82:
      const merchPIN = sanitize(input);
      
      response = con('Merchant payment. Pending Postman for exact payload. 0. Back');
      session.step = 30;
      break;

    // --- Change PIN ---
    case 90:
      if (input === '0') {
        session.step = 30;
        response = con(`Welcome ${session.userName}!
1. My Account
2. Airtime
3. Funds Transfer
4. Pay Merchant
5. Change PIN
00. Exit`);
      } else {
        session.oldPIN = sanitize(input);
        session.step = 91;
        response = con('Enter new PIN:');
      }
      break;
    case 91:
      session.newPIN = sanitize(input);
      session.step = 92;
      response = con('Confirm new PIN:');
      break;
    case 92:
      if (session.newPIN !== sanitize(input)) {
        response = con('PINs do not match. Enter new PIN:');
        session.step = 91;
      } else {
        response = con('PIN changed successfully. 0. Back');
        session.step = 30;
      }
      break;

    default:
      response = end('Invalid input. Start again.');
      session.step = 0;
      break;
  }

  setSessionData(sessionId, session);
  return response;
}

module.exports = { handleMenu };
