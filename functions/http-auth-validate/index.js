const functions = require("@google-cloud/functions-framework");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://api-dev.sterndeck.com/api/v1/auth-jwks",
});

const getSigningKey = promisify(client.getSigningKey);

async function getKey(header, callback) {
  const key = await getSigningKey(header.kid);
  const signingKey = key.getPublicKey();
  callback(null, signingKey);
}

functions.http("authValidate", async (req, res) => {
  try {
    const authorizationHeader = req.get("Authorization");
    if (!authorizationHeader) {
      return res
        .status(401)
        .send("Unauthorized: No Authorization header provided");
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send("Unauthorized: Invalid Bearer token");
    }

    const options = {
      audience: "sterndeck",
      issuer: "https://api-dev.sterndeck.com/api/v1/auth-validate",
      algorithms: ["RS256"],
    };

    const verify = promisify(jwt.verify);
    const decoded = await verify(token, getKey, options);

    // Add the decoded JWT payload to the request object.
    req.user = decoded;

    // Handle the rest of your logic here
    res.status(200).send("Token is valid");
  } catch (err) {
    console.error(err);
    res.status(401).send("Unauthorized: Invalid token");
  }
});
