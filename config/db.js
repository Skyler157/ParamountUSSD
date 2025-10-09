require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,   
  server: process.env.DB_HOST,             
  port: parseInt(process.env.DB_PORT, 10) || 55770,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
};

const pool = new sql.ConnectionPool(dbConfig);

const poolConnect = pool.connect()
  .then(() => console.log(`Connected to SQL Server on ${dbConfig.server}:${dbConfig.port}`))
  .catch(err => console.error('SQL connection error:', err));

module.exports = { sql, poolConnect, pool };
