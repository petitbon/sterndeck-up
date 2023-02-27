"use strict";

// [START functions_http_content]
const escapeHtml = require("escape-html");
const functions = require("@google-cloud/functions-framework");

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http("helloContent", (req, res) => {
  let name;

  switch (req.get("content-type")) {
    // '{"name":"John"}'
    case "application/json":
      ({ name } = req.body);
      break;
  }

  res.status(200).send(`Hello ${escapeHtml(name || "World")}!`);
});
// [END functions_http_content]
