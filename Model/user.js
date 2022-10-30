const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserModel = new Schema({
  _id: String,
  userName: String,
  userMail: String,
  userPhoto: String,
  userBankToken: String,
});

module.exports = mongoose.model("User", UserModel);
