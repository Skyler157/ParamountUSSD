const cron = require('node-cron');
const axios = require('axios');

const USSD_URL = 'http://172.17.50.13:4000/paramountUSSD';

async function pingUssd() {
  try {
    const response = await axios.post(USSD_URL, {
      sessionId: 'cron-session',
      phoneNumber: '+254705285825',
      input: ''
    });
    console.log(`USSD ping successful: ${response.status}`);
  } catch (err) {
    console.error(`USSD ping failed: ${err.message}`);
  }
}

cron.schedule('*/10 * * * *', pingUssd);

// run immediately once
pingUssd();
