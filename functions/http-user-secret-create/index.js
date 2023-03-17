const functions = require("@google-cloud/functions-framework");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

async function createSecret(parent, secretId, name) {
  const [secret] = await client.createSecret({
    parent: parent,
    secretId: secretId,
    name: name,
    secret: {
      replication: {
        automatic: {},
      },
    },
  });
  return secret;
}

async function addSecretVersion(parent, payload) {
  const [version] = await client.addSecretVersion({
    parent: parent,
    payload: {
      data: payload,
    },
  });
  return version.name;
}

async function accessSecretVersion(name) {
  const [version] = await client.accessSecretVersion({
    name: name,
  });
}

functions.http("userSecretCreate", async (req, res) => {
  const myPID = process.env.PROJECT_ID;

  if (!myPID) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  const body = {
    user_uid: req.body.user_uid,
    secret: req.body.secret,
  };

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const secretId = body.user_uid;
        const apiKey = body.secret;
        const payload = Buffer.from(apiKey, "utf8");

        const baseParent = `projects/${myPID}`;
        const parent = `${baseParent}/secrets/${secretId}`;
        const name = `${parent}/versions/latest`;
        let secretExist = false;
        try {
          await accessSecretVersion(name);
          secretExist = true;
        } catch {
          secretExist = false;
        }
        if (!secretExist) {
          await createSecret(baseParent, secretId);
        }

        const apiSecret = await addSecretVersion(parent, payload);

        res.status(200).send(apiSecret);
        break;
    }
  } else {
    res.status(404);
  }
});
