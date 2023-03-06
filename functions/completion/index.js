"use strict";

// [START functions_http_content]

const gcpMetadata = require("gcp-metadata");
const fetch = require("node-fetch");
const escapeHtml = require("escape-html");
const firebase = require("firebase-admin");
const functions = require("@google-cloud/functions-framework");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

firebase.initializeApp();

let isAuth = false;
async function getSecret(name) {
  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

functions.http("completion", async (req, res) => {
  const isAvailable = await gcpMetadata.isAvailable();
  let projectId;
  if (isAvailable) {
    projectId = await gcpMetadata.project("project-id");
  }
  const myPID = projectId || process.env.PROJECT_ID;
  const my_key = await getSecret(
    `projects/${myPID}/secrets/OPENAI_API_KEY/versions/1`
  );
  const myKEY = my_key || process.env.OPENAI_API_KEY;
  if (!myPID || !myKEY) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  const apiGateway = req.get("X-Apigateway-Api-Userinfo");
  //  if (GoogleAuth) isAuth = true;
  const authBearer = req.get("Authorization");

  console.log("apiGateway:", apiGateway);
  console.log("authBearer:", authBearer);
  /*
  if (Auth) {
    console.log("AUTH: ", Auth);
    const nAuth = Auth.replace(/Bearer /gi, "");
    const firestore = firebase.firestore();
    const keyRef = firestore.collection("keys").doc(nAuth);
    const key = await keyRef.get();
    console.log("KEY: ", key.json());
    if (!key.exists) {
      res.status(500).send(`Authentication Error 1.`);
      return;
    } else {
      if (key.data().status != "disabled") {
        isAuth = true;
      } else {
        res.status(500).send(`Authentication Error 2.`);
        return;
      }
    }
  }
  */
  const body = { model: req.body.model, prompt: req.body.prompt };

  if (req.method === "POST" && isAuth) {
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

// [END functions_http_content]
