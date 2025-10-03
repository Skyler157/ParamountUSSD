require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ussdRoutes = require('./routes/ussd');

const app = express();


app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/paramountUSSD', ussdRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => 
  console.log(`USSD server running on port ${PORT}`)
);
