const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express(); // ✅ This was missing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/mark-complete', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];
    const jobName = action.value;
    if (!jobName) throw new Error("Job name not found");


    const response = await axios.post(process.env.MARK_COMPLETE_URL, { jobName });

    res.status(200).send(); // Respond to Slack to avoid timeout
  } catch (error) {
    console.error('Error processing Slack interaction:', error);
    res.status(500).send();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mark Complete server running on port ${PORT}`);
});
