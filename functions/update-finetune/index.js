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
  let message;
  const firestore = firebase.firestore();
  const mysec = process.env.PROJECT_ID;
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

        console.log("collection:", req.body.collection);
        console.log("finetuneid:", req.body.finetuneid);
        console.log("res:", response);
        const another = await firestore
          .collection(req.body.collection)
          .doc(req.body.finetuneid)
          .set(response);
        message = response;
        break;
    }

    res.status(201).send(`"ok ${JSON.stringify(message) || " you "}"`);
  } else {
    res.status(404);
  }
};

/*






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
  let response;
  const firestore = firebase.firestore();
  const mysec = process.env.PROJECT_ID || "117456302577";
  const myp = await getSecret(
    `projects/${mysec}/secrets/OPENAI_API_KEY/versions/1`
  );

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        response = await fetch(
          `https://api.openai.com/v1/fine-tunes/${req.body.finetuneid}`,
          {
            headers: {
              Authorization: `Bearer ${myp}`,
            },
          }
        )
          .then((res) => {
            res.json();
          })
          .then((data) => {
            console.log("collection:", req.body.collection);
            console.log("finetuneid:", req.body.finetuneid);
            console.log("res:", data);
            const ft = firestore
              .collection(req.body.collection)
              .doc(req.body.finetuneid)
              .set(data);
            return ft;
          });

        break;
    }

    res.status(201).send(`"ok ${JSON.stringify(response) || " you "}"`);
  } else {
    res.status(404);
  }
};
*/
