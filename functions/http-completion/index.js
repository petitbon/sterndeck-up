"use strict";

const fetch = require("node-fetch");
const functions = require("@google-cloud/functions-framework");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

functions.http("completion", async (req, res) => {
  const myPID = process.env.PROJECT_ID;
  const my_key = await getSecret(
    `projects/${myPID}/secrets/OPENAI_API_KEY/versions/1`
  );
  const myKEY = my_key || process.env.OPENAI_API_KEY;
  if (!myPID || !myKEY) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  const body = { model: req.body.model, prompt: req.body.prompt };

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const response = await fetch(`https://api.openai.com/v1/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${myKEY}`,
          },
          body: JSON.stringify(body),
        });
        const jsonresponse = await response.json();
        res.status(200).send(JSON.stringify(jsonresponse));
        break;
    }
  }
});
