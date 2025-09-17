const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 🔹 Wake-up route for uptime monitors
app.get('/', (req, res) => {
  res.status(200).send('✅ Server is awake');
});

// 🔹 Slack interaction handler
app.post('/slack/interactions', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions?.[0];

    // 🔹 Handle "Mark Complete"
    if (action?.action_id === 'mark_complete') {
      const { jobName, jobTitle } = JSON.parse(action.value);
      console.log("✅ Received Mark Complete:", { jobName, jobTitle });

      const response = await axios.post(process.env.MARK_COMPLETE_URL, {
        jobName,
        jobTitle
      });

      console.log("📬 Apps Script response:", response.data);
      return res.status(200).send();
    }

    // 🔹 Handle "Change End Date" button click
    if (action?.action_id === 'change_end_date') {
      const triggerId = payload.trigger_id;
      const value = JSON.parse(action.value); // { jobName, jobTitle, row }

      const modalView = {
        trigger_id: triggerId,
        view: {
          type: 'modal',
          callback_id: 'submit_new_end_date',
          title: { type: 'plain_text', text: 'Update End Date' },
          submit: { type: 'plain_text', text: 'Save' },
          close: { type: 'plain_text', text: 'Cancel' },
          private_metadata: JSON.stringify(value),
          blocks: [
            {
              type: 'input',
              block_id: 'new_end_date_block',
              label: { type: 'plain_text', text: 'Select New End Date' },
              element: {
                type: 'datepicker',
                action_id: 'new_end_date'
              }
            }
          ]
        }
      };

      await axios.post('https://slack.com/api/views.open', modalView, {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      return res.status(200).send();
    }

    // 🔹 Handle modal submission
    if (payload.type === 'view_submission' && payload.view.callback_id === 'submit_new_end_date') {
      const metadata = JSON.parse(payload.view.private_metadata);
      const selectedDate = payload.view.state.values.new_end_date_block.new_end_date.selected_date;

      console.log("📅 New End Date Submitted:", { ...metadata, selectedDate });

      const response = await axios.post(process.env.UPDATE_END_DATE_URL, {
        ...metadata,
        newEndDate: selectedDate
      });

      console.log("📬 Apps Script response:", response.data);

      return res.json({ response_action: 'clear' }); // Close modal
    }

    res.status(200).send();
  } catch (error) {
    console.error('❌ Error handling Slack interaction:', error.message);
    res.status(500).send();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Slack interaction server running on port ${PORT}`);
});
