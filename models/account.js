let accounts = {}; // { accountNumber: { balance: 12500 } }

function checkBalance(account) {
  if (!accounts[account]) accounts[account] = { balance: 12500 }; // default
  return accounts[account].balance;
}

function transferMoney(sender, recipient, amount) {
  if (!accounts[sender]) accounts[sender] = { balance: 12500 };
  if (!accounts[recipient]) accounts[recipient] = { balance: 0 };

  if (accounts[sender].balance < amount) return false;

  accounts[sender].balance -= amount;
  accounts[recipient].balance += amount;
  return true;
}

module.exports = { checkBalance, transferMoney };
