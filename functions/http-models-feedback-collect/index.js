"use strict";

const functions = require("@google-cloud/functions-framework");
const firebase = require("firebase-admin");

firebase.initializeApp();

functions.http("modelsFeedbackCollect", async (req, res) => {
  const body = {
    model: req.body.model,
    prompt: req.body.prompt,
    completion: req.body.completion,
  };

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const firestore = firebase.firestore();
        await firestore.collection("models_feedback").add(body);
        res.status(200).send("OK");
        break;
    }
  }
});
