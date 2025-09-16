function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const spreadsheetId = "1xqBWQlN6Y9vJ4gtAf2R0qGw6iwV3ZLjFK7UXWDCVpLY";
    const sheetName = "Jobs List";

    // 🔹 Handle "Mark Complete" from Slack button
    if (payload.jobName && payload.jobTitle) {
      const jobName = payload.jobName;
      const jobTitle = payload.jobTitle;

      const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];

      const jobIndex = headers.indexOf("Job");
      const titleIndex = headers.indexOf("Title");
      const markedCompleteIndex = headers.indexOf("Marked Complete");
      const percentCompleteIndex = headers.indexOf("Percent Complete");

      for (let i = 1; i < data.length; i++) {
        const rowJob = data[i][jobIndex];
        const rowTitle = data[i][titleIndex];

        if (rowJob === jobName && rowTitle === jobTitle) {
          sheet.getRange(i + 1, markedCompleteIndex + 1).setValue("TRUE");
          sheet.getRange(i + 1, percentCompleteIndex + 1).setValue(100);
          return ContentService.createTextOutput("✅ Job marked complete.");
        }
      }

      return ContentService.createTextOutput("⚠️ Job not found.");
    }

    // 🔹 Handle Slack button click to open modal
    if (payload.type === "block_actions" && payload.actions[0].action_id === "change_end_date") {
      const triggerId = payload.trigger_id;
      const value = JSON.parse(payload.actions[0].value); // { jobName, jobTitle, row }

      const modalView = {
        trigger_id: triggerId,
        view: {
          type: "modal",
          callback_id: "submit_new_end_date",
          title: { type: "plain_text", text: "Update End Date" },
          submit: { type: "plain_text", text: "Save" },
          close: { type: "plain_text", text: "Cancel" },
          private_metadata: JSON.stringify(value),
          blocks: [
            {
              type: "input",
              block_id: "new_end_date_block",
              label: { type: "plain_text", text: "Select New End Date" },
              element: {
                type: "datepicker",
                action_id: "new_end_date"
              }
            }
          ]
        }
      };

      UrlFetchApp.fetch("https://slack.com/api/views.open", {
        method: "post",
        contentType: "application/json",
        headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
        payload: JSON.stringify(modalView)
      });

      return ContentService.createTextOutput(""); // Slack expects 200 OK
    }

    // 🔹 Handle modal submission
    if (payload.type === "view_submission" && payload.view.callback_id === "submit_new_end_date") {
      const metadata = JSON.parse(payload.view.private_metadata); // { jobName, jobTitle, row }
      const selectedDate = payload.view.state.values.new_end_date_block.new_end_date.selected_date;

      const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
      const headers = sheet.getDataRange().getValues()[0];
      const endIndex = headers.indexOf("End");

      const row = metadata.row + 1; // +1 for header offset
      sheet.getRange(row, endIndex + 1).setValue(new Date(selectedDate));

      return ContentService.createTextOutput(JSON.stringify({ response_action: "clear" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("⚠️ No action matched.");
  } catch (error) {
    console.error("❌ Error in doPost:", error);
    return ContentService.createTextOutput("❌ Error processing request.");
  }
}
