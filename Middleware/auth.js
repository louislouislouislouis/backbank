const Mongoose = require("mongoose");

const HttpError = require("../Model/util/httpErr");
const jwt = require("jsonwebtoken");
var admin = require("firebase-admin");
const User = require("../Model/user");

const serviceAccount = {
  type: process.env.FIREBASE_CONFIG_type,
  project_id: process.env.FIREBASE_CONFIG_project_id,
  private_key_id: process.env.FIREBASE_CONFIG_private_key_id,
  private_key: process.env.FIREBASE_CONFIG_private_key,
  client_email: process.env.FIREBASE_CONFIG_client_email,
  client_id: process.env.FIREBASE_CONFIG_client_id,
  auth_uri: process.env.FIREBASE_CONFIG_auth_uri,
  token_uri: process.env.FIREBASE_CONFIG_token_uri,
  auth_provider_x509_cert_url:
    process.env.FIREBASE_CONFIG_auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.FIREBASE_CONFIG_client_x509_cert_url,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = async (req, res, next) => {
  console.log("Call check Auth");
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Auth Failed");
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = {
        name: decodedToken.name,
        id: decodedToken.uid,
        email: decodedToken.email,
        userPhoto: decodedToken.picture,
      };
      req.user = user;
      let userInDB = await User.findById(user.id);
      if (userInDB) {
        userInDB.userMail = user.email;
        userInDB.userName = user.name;
        userInDB.userPhoto = user.userPhoto;
      } else {
        userInDB = await new User({
          _id: user.id,
          userMail: decodedToken.email,
          userName: decodedToken.name,
          userPhoto: decodedToken.userPhoto,
        });
      }
      let sess = await Mongoose.startSession();
      try {
        sess.startTransaction();
        await userInDB.save({ session: sess });
        await sess.commitTransaction();
      } catch (err) {
        sess.abortTransaction();
      }

      next();
    } catch (err) {
      console.log(err);
      const error = new HttpError(err, 403);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError("Authorization failed", 403);
    return next(error);
  }
};
