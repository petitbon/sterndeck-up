"use strict";

const functions = require("@google-cloud/functions-framework");
const firebase = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const csvWriter = require("csv-writer").createObjectCsvWriter;

firebase.initializeApp();
const storage = new Storage();
const firestore = firebase.firestore();

const myPID = process.env.PROJECT_NAME || "sterndeck-4";

if (!myPID) {
  res.status(500).send(`Environment variables are not set.`);
  return;
}

functions.http("feedbackCollect", async (req, res) => {
  const body = {
    threshold: req.body.threshold || 200,
  };

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        await countItemsAndStore(body.threshold);
        res.status(200).send("OK");
        break;
    }
  }
});

async function countItemsAndStore(threshold) {
  const collectionRef = firestore.collection("models_feedback");
  const querySnapshot = await collectionRef.get();

  const modelCounts = new Map();

  querySnapshot.docs.forEach((doc) => {
    const model = doc.data().model;
    const count = modelCounts.get(model) || 0;
    modelCounts.set(model, count + 1);
  });

  for (const [model, count] of modelCounts) {
    if (count >= threshold) {
      const items = querySnapshot.docs
        .filter((doc) => doc.data().model === model)
        .map((doc) => {
          const data = doc.data();
          return { prompt: data.prompt, completion: data.completion };
        });

      const bucketName = `${myPID}.appspot.com`;
      const fileName = Date.now() + ".csv";

      await storeItemsAsCsv(items, fileName, bucketName, model);
    }
    //console.log(`Count of items with model "${model}": ${count}`);
  }
}

async function storeItemsAsCsv(items, csvPath, bucketName, model) {
  const header = [
    { id: "prompt", title: "prompt" },
    { id: "completion", title: "completion" },
  ];

  const writer = csvWriter({
    path: csvPath,
    header,
  });

  await writer.writeRecords(items);
  const options = {
    destination: "feeback-files/" + model + "/" + csvPath,
  };

  const bucket = storage.bucket(bucketName);
  await bucket.upload(csvPath, options);
  //console.log(`CSV file stored at: gs://${bucketName}/${csvPath}`);
}
