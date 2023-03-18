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
    `projects/${myPID}/secrets/${req.body.user_uid}/versions/latest`
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
    user_uid: req.body.user_uid,
    model_id: req.body.model_id,
    training_file_id: req.body.training_file_id,
    use_case_id: req.body.use_case_id,
    path: `models/${req.body.user_uid}/list/${req.body.model_id}/training_files/${req.body.training_file_id}/fine_tunes`,
    base_model: req.body.base_model,
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
          model: body.base_model,
          n_epochs: hype.n_epochs,
          learning_rate_multiplier: hype.learning_rate_multiplier,
          prompt_loss_weight: hype.prompt_loss_weight,
          suffix:
            "sterndeck-" + body.use_case_id + "-" + body.model_id.slice(0, 5),
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
