const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/mark-complete', async (req, res) => {
  try {
    const payload = req.body;

    // Forward to your Google Apps Script Web App
    const response = await axios.post(process.env.MARK_COMPLETE_URL, payload);

    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error forwarding to Apps Script:', error);
    res.status(500).send('Failed to process request');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mark Complete server running on port ${PORT}`);
});

