const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const markComplete = require('./routes/markComplete');
const assignTrades = require('./routes/assignTrades');
const clearLog = require('./routes/clearLog');

const app = express();
app.use(bodyParser.json());

app.post('/mark-complete', markComplete);
app.post('/assign-trades', assignTrades);
app.post('/clear-log', clearLog);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Automation Hub running on port ${PORT}`);
});
