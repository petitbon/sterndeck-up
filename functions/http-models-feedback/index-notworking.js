"use strict";

const functions = require("@google-cloud/functions-framework");

const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

const myPID = process.env.PROJECT_NAME || "sterndeck-4";

if (!myPID) {
  res.status(500).send(`Environment variables are not set.`);
  return;
}

functions.http("modelsFeedback", async (req, res) => {
  const datasetId = "sterndeck-feedback";
  const tableId = "table-feedback";

  console.log(req);
  console.log(req.body);

  const body = {
    model: req.body.model,
    prompt: req.body.prompt,
    completion: req.body.completion,
  };

  console.log(body);

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        /* 
        try {
          const doit = await bigquery
            .dataset(datasetId)
            .table(tableId)
            .insert(rowData);
          console.log(doit);
          res.status(200).send("Data inserted successfully.");
        } catch (error) {
          console.error("Error inserting data:", error);
          res.status(500).send("Error inserting data.");
        }
        */

        res.status(200).send("OK");
        break;
    }
  }
});
