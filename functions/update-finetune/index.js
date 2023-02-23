// triggered by workflow
//

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

exports.updateFinetune = async (req, res) => {
  let updated_finetune;

  const mysec = process.env.PROJECT_ID || "117456302577";

  if (!mysec) {
    res.status(500).send(`PROJECT_ID environment variable not set.`);
    return;
  }

  const myp = await getSecret(
    `projects/${mysec}/secrets/OPENAI_API_KEY/versions/1`
  );

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const response = await fetch(
          `https://api.openai.com/v1/fine-tunes/${req.body.finetuneid}`,
          {
            headers: {
              Authorization: `Bearer ${myp}`,
            },
          }
        );

        updated_finetune = await response.json();

        const firestore = firebase.firestore();
        await firestore
          .collection(req.body.collection)
          .doc(req.body.finetuneid)
          .set(updated_finetune);

        break;
    }

    res.status(201).send(`"ok ${JSON.stringify(updated_finetune) || " you "}"`);
  } else {
    res.status(404);
  }
};
