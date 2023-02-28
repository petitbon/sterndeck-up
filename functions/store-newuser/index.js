// on new user registration

const firebase = require("firebase-admin");
const { ApiKeysClient } = require("@google-cloud/apikeys").v2;

firebase.initializeApp();

exports.newUser = async (user) => {
  const firestore = firebase.firestore();
  const apikeysClient = new ApiKeysClient();

  const request = {
    parent: "projects/sterndeck-4/locations/global",
    key: {
      displayName: `api-key-${user.uid}`,
    },
  };

  const [operation] = await apikeysClient.createKey(request);
  const [response] = await operation.promise();

  //console.log(`Created API Key: ${JSON.stringify(response)}`);

  let jwt = response;

  return firestore
    .collection("users")
    .doc(user.uid)
    .set({
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      apiKey: {
        name: jwt.name,
        displayName: jwt.displayName,
        keyString: jwt.keyString,
        uid: jwt.uid,
      },
    });
};
