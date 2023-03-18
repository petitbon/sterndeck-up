//
// this function is triggered by the finetune workflow
//

const functions = require("@google-cloud/functions-framework");
const fetch = require("node-fetch");
const firebase = require("firebase-admin");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

firebase.initializeApp();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

functions.http("fineTunesUpdate", async (req, res) => {
  const myPID = process.env.PROJECT_ID;
  const my_key = await getSecret(
    `projects/${myPID}/secrets/${req.body.user_uid}/versions/latest`
  );
  const myKEY = my_key || process.env.OPENAI_API_KEY;
  if (!myPID || !myKEY) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  let updated_finetune;

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const response = await fetch(
          `https://api.openai.com/v1/fine-tunes/${req.body.finetuneid}`,
          {
            headers: {
              Authorization: `Bearer ${myKEY}`,
            },
          }
        );

        updated_finetune = await response.json();

        const firestore = firebase.firestore();
        await firestore
          .collection(req.body.collection)
          .doc(req.body.finetuneid)
          .set(updated_finetune);

        if (updated_finetune.fine_tuned_model) {
          await firestore
            .collection(
              `models/${req.body.user_uid}/list/${req.body.model_id}/live_models`
            )
            .doc(updated_finetune.fine_tuned_model)
            .set({
              id: updated_finetune.fine_tuned_model,
              createdAt: new Date(),
            });
        }
        break;
    }

    res.status(201).send(`"ok ${JSON.stringify(updated_finetune) || " you "}"`);
  } else {
    res.status(404);
  }
});
