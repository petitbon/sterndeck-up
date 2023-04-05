const functions = require("@google-cloud/functions-framework");
const jose = require("node-jose");

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

functions.http("authJWKS", async (req, res) => {
  const myPID = process.env.PROJECT_ID;

  const privateKey = await getSecret(
    `projects/${myPID}/secrets/private_key_pem/versions/latest`
  );

  if (!myPID || !privateKey) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  let jwks;
  try {
    // Load the public key from the PEM file
    const publicKey = await jose.JWK.asKey(publicKeyPem, "pem");

    // Extract the key's JSON Web Key (JWK) representation
    const jwk = publicKey.toJSON(false);

    // Extract the base64url encoded modulus (n) and exponent (e)
    const { n, e } = jwk;

    jwks = {
      keys: [
        {
          kty: "RSA",
          alg: "RS256",
          use: "sig",
          kid: "001",
          n: n,
          e: e,
        },
      ],
    };
  } catch (err) {
    console.error(err);
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(jwks));
});
