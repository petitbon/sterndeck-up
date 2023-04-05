const functions = require("@google-cloud/functions-framework");
const jwt = require("jsonwebtoken");

// LOCAL DEVELOPMENT
//const fs = require("fs");
//const path = require("path");
//const privateKey = fs.readFileSync(
//  path.join(__dirname, "private_key.pem"),
//  "utf8"
//);

const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

functions.http("authGenerate", async (req, res) => {
  const myPID = process.env.PROJECT_ID;

  const privateKey = await getSecret(
    `projects/${myPID}/secrets/private_key_pem/versions/latest`
  );

  if (!myPID || !privateKey) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  const body = {
    user_uid: req.body.user_uid,
  };

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        try {
          // Define the payload for the JWT
          const payload = {
            sub: body.user_uid,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 525600, // Set the token to expire in 60 years
          };

          // Sign the JWT using your private key
          const token = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            issuer: "https://api-dev.sterndeck.com/api/v1/auth-validate",
            audience: "sterndeck",
            keyid: "001",
          });

          res.status(200).send({ token });
        } catch (err) {
          console.error(err);
          res.status(500).send("Error generating JWT");
        }

        break;
    }
  } else {
    res.status(404);
  }
});
