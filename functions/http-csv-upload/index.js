const functions = require("@google-cloud/functions-framework");

const { Storage } = require("@google-cloud/storage");
const firebase = require("firebase-admin");
const path = require("path");
const os = require("os");
const EOL = require("os").EOL;
const fs = require("fs");
const Busboy = require("busboy");
const csv = require("csv");

const { Configuration, OpenAIApi } = require("openai");

const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

firebase.initializeApp();

const client = new SecretManagerServiceClient();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({ name });
  const secretValue = version.payload.data.toString();
  return secretValue;
}

const storage = new Storage();

functions.http("csvUpload", async (req, res) => {
  const myPID = process.env.PROJECT_NAME || "sterndeck-4";

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

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const firestore = firebase.firestore();

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();

  const fields = {};
  const uploads = {};

  busboy.on("field", async (fieldname, val) => {
    fields[fieldname] = val;
  });

  const fileWrites = [];

  busboy.on("file", (fieldname, file, { filename }) => {
    const filepath = path.join(tmpdir, filename);
    uploads[fieldname] = filepath;
    const writeStream = fs.createWriteStream(filepath);

    const parse = csv.parse({ delimiter: ",", from_line: 2 });

    const transform = csv.transform((row, cb) => {
      var obj = {};
      obj.prompt = row[0] + "##>>";
      obj.completion = " " + row[1] + "<<##";
      result = JSON.stringify(obj) + EOL;
      cb(null, result);
    });

    file.pipe(parse).pipe(transform).pipe(writeStream);

    const promise = new Promise((resolve, reject) => {
      file.on("end", () => {
        writeStream.end();
      });
      writeStream.on("close", resolve);
      writeStream.on("error", reject);
    });
    fileWrites.push(promise);
  });

  busboy.on("finish", async () => {
    await Promise.all(fileWrites);

    for (const file in uploads) {
      const openai = new OpenAIApi(configuration);
      const oai_response = await openai.createFile(
        fs.createReadStream(uploads[file]),
        "fine-tune"
      );
      const trainingFile = oai_response.data;
      const bucket = `${myPID}.appspot.com`;
      const path = `training-files/${fields.user_uid}/${fields.model_id}/`;
      const fullfilepath = path + trainingFile.id + ".jsonl";
      const options = {
        destination: fullfilepath,
      };
      await storage.bucket(bucket).upload(uploads[file], options);
      const tf = { ...trainingFile, path: fullfilepath, visible: true };
      const docpath = `models/${fields.user_uid}/list/${fields.model_id}/training_files`;
      await firestore.collection(docpath).doc(tf.id).set(tf);
      fs.unlinkSync(uploads[file]);
      res.status(200).send(JSON.stringify(tf));
    }
  });

  busboy.end(req.rawBody);
});
