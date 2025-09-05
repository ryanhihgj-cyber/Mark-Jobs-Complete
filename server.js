const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/mark-complete', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];

    const { jobName, jobTitle } = JSON.parse(action.value);

    console.log("✅ Received Slack button click:", { jobName, jobTitle });

    // Send to Google Apps Script
    const response = await axios.post(process.env.MARK_COMPLETE_URL, {
      jobName,
      jobTitle
    });

    console.log("📬 Apps Script response:", response.data);

    // Respond to Slack immediately
    res.status(200).send();
  } catch (error) {
    console.error('❌ Error processing Slack interaction:', error.message);
    res.status(500).send();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mark Complete server running on port ${PORT}`);
});
