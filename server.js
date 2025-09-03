app.post('/mark-complete', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions[0];
    const rowIndex = parseInt(action.value); // This is the row index from your button
    const jobName = payload.message.blocks[rowIndex]?.text?.text?.match(/\*Job:\* (.+)/)?.[1];

    if (!jobName) throw new Error("Job name not found");

    const response = await axios.post(process.env.MARK_COMPLETE_URL, { jobName });

    res.status(200).send(); // Respond to Slack to avoid timeout
  } catch (error) {
    console.error('Error processing Slack interaction:', error);
    res.status(500).send();
  }
});

