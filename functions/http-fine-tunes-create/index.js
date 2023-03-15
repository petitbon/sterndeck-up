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

functions.http("fineTunesCreate", async (req, res) => {
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

  const body = {
    training_file_id: req.body.training_file_id,
    path: req.body.path,
    use_case_id: req.body.use_case_id,
  };

  const firestore = firebase.firestore();

  if (req.method === "POST") {
    switch (req.get("content-type")) {
      case "application/json":
        const use_case = await firestore
          .collection("use_cases")
          .doc(body.use_case_id)
          .get();

        const acase = use_case.data();
        const hype = acase.hyper_parameters;

        //console.log("model:", acase.model);
        //console.log("n_epochs:", hype.n_epochs);
        //console.log("learning_rate_multiplier:", hype.learning_rate_multiplier);
        //console.log("prompt_loss_weight:", hype.prompt_loss_weight);
        //console.log("trining_file_id:", body.training_file_id);

        const openai = new OpenAIApi(configuration);
        const oai_response = await openai.createFineTune({
          training_file: body.training_file_id,
          model: acase.model,
          n_epochs: hype.n_epochs,
          learning_rate_multiplier: hype.learning_rate_multiplier,
          prompt_loss_weight: hype.prompt_loss_weight,
          suffix: body.use_case_id,
        });
        const fine_tune = oai_response.data;
        if (fine_tune.id) {
          await firestore
            .collection(body.path)
            .doc(fine_tune.id)
            .set(fine_tune);
        }
        res.status(200).send(JSON.stringify(fine_tune));
        break;
    }
  } else {
    res.status(404);
  }
});
