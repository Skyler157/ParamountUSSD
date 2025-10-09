// httpClient.js
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const httpClient = axios.create({
  baseURL: 'https://172.17.80.12:50559/ParamountGateway',
  httpsAgent: agent,
});

module.exports = httpClient;
