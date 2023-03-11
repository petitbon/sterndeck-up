// on new user registration

const firebase = require("firebase-admin");

firebase.initializeApp();

exports.userCreate = async (user) => {
  const firestore = firebase.firestore();

  return firestore.collection("users").doc(user.uid).set({
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: new Date(),
  });
};
