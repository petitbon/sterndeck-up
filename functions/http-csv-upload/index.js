const functions = require("@google-cloud/functions-framework");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const os = require("os");
const EOL = require("os").EOL;
const fs = require("fs");
const Busboy = require("busboy");
const csv = require("csv");

const storage = new Storage();

functions.http("upload", async (req, res) => {
  const myPID = process.env.PROJECT_NAME;

  if (!myPID) {
    res.status(500).send(`Environment variables are not set.`);
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();

  const fields = {};
  const uploads = {};

  busboy.on("field", (fieldname, val) => {
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
      obj.prompt = row[0] + " ->";
      obj.completion = " " + row[1] + " END";
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
      const bucket = `${myPID}.appspot.com`;
      const path = `training-files/${fields.user_uid}/${fields.model_id}/`;
      const fullfilepath = path + fields.file_id + ".jsonl";
      const options = {
        destination: fullfilepath,
      };
      await storage.bucket(bucket).upload(uploads[file], options);
      fs.unlinkSync(uploads[file]);
    }

    res.status(200).send(`File was uploaded.`);
  });

  busboy.end(req.rawBody);
});

async function uploadFile(file) {}
