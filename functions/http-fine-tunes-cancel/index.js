"use strict";

const functions = require("@google-cloud/functions-framework");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const firebase = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");

const client = new SecretManagerServiceClient();

firebase.initializeApp();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

functions.http("fineTunesCancel", async (req, res) => {
  const myPID = process.env.PROJECT_ID;
  const my_key = await getSecret(
    `projects/${myPID}/secrets/${req.body.user_uid}/versions/latest`
  );
  const myKEY = my_key || process.env.OPENAI_API_KEY;
  if (!myPID || !myKEY) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  const configuration = new Configuration({
    apiKey: myKEY,
  });

  const body = { fine_tune_id: req.body.fine_tune_id, path: req.body.path };

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const openai = new OpenAIApi(configuration);
        const oai_response = await openai.cancelFineTune(body.fine_tune_id);
        const response = oai_response.data;
        if (response.status == "cancelled") {
          const firestore = firebase.firestore();
          await firestore
            .collection(body.path)
            .doc(body.fine_tune_id)
            .set(response);
        }
        res.status(200).send(JSON.stringify(response));
        break;
    }
  }
});
