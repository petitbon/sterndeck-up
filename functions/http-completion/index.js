const functions = require("@google-cloud/functions-framework");
const firebase = require("firebase-admin");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const { Configuration, OpenAIApi } = require("openai");

const client = new SecretManagerServiceClient();

firebase.initializeApp();

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

  const configuration = new Configuration({
    apiKey: myKEY,
  });

  const parsedOne = req.body.model.split(":");
  const parsedTwo = parsedOne[2].split("-");
  const use_case_id = parsedTwo[0];

  const firestore = firebase.firestore();

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const use_case = await firestore
          .collection("use_cases")
          .doc(use_case_id)
          .get();

        const acase = use_case.data();

        const body = {
          model: req.body.model,
          prompt: req.body.prompt + acase.prompt_separator,
          temperature: acase.hyper_parameters.temperature,
          stop: [acase.completion_separator],
          frequency_penalty: acase.hyper_parameters.frequency_penalty,
          presence_penalty: acase.hyper_parameters.presence_penalty,
          max_tokens: 100,
        };

        //console.log(JSON.stringify(body));

        const openai = new OpenAIApi(configuration);

        try {
          const oai_response = await openai.createCompletion(body);
          const completion = oai_response.data;
          res.status(200).send(JSON.stringify(completion));
          break;
        } catch (err) {
          console.log(err);
          res.status(500).send(`Internal error: ${err.message}`);
          break;
        }
    }
  }
});
