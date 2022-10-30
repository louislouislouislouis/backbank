const axios = require("axios");
const HttpError = require("../../Model/util/httpErr");
const { validationResult } = require("express-validator");
const Mongoose = require("mongoose");
const User = require("../../Model/user");

const getLink = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    let msg = "";
    errors.array().forEach((element) => {
      msg += JSON.stringify(element);
    });
    return next(new HttpError(msg, 422));
  }
  console.log(req.user);
  let userId = req.user.id;
  const url = process.env.PLAID_URL_LINKGENERATION;
  const json = {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    user: {
      client_user_id: userId,
    },
    client_name: "BankBackPLAID",
    products: ["auth", "transactions", "identity"],
    country_codes: ["GB", "FR", "US", "CA"],
    language: "en",
    webhook: "https://sample-web-hook.com",
    android_package_name: "com.succiue.myapplication",
  };
  let rep;
  try {
    rep = await axios.post(url, json, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.log(err);
  }

  if (!rep || !rep.data || !rep.data.link_token) {
    const error = new HttpError("Error trying get link", 500);
    return next(error);
  }

  res.status(200).json({ tokenLink: rep.data.link_token });
};

const getAccessToken = async (req, res, next) => {
  // TO IMPLEMENT
  //let { uderId } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    let msg = "";
    errors.array().forEach((element) => {
      msg += JSON.stringify(element);
    });
    return next(new HttpError(msg, 422));
  }

  let userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) return next(new HttpError("User Not Found", 422));

  res.status(200).json({ accessToken: user.userBankToken || false });
};

const exchangePktoAccessToken = async (req, res, next) => {
  // TO IMPLEMENT

  let { publicToken } = req.body;
  const url = process.env.PLAID_URL_TOKENEXCHANGE;
  const json = {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    public_token: publicToken,
  };

  let rep;
  try {
    rep = await axios.post(url, json, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.log(err);
  }

  if (!rep || !rep.data || !rep.data.access_token) {
    const error = new HttpError("Error trying get accessToken", 500);
    return next(error);
  }

  let userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) return next(new HttpError("User Not Found", 422));

  user.userBankToken = rep.data.access_token;
  let sess = await Mongoose.startSession();
  try {
    sess.startTransaction();
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    sess.abortTransaction();
    const error = new HttpError("Error trying put accessToken", 500);
    return next(error);
  }

  res.status(200).json({ access_token: rep.data.access_token });
};

exports.exchangePktoAccessToken = exchangePktoAccessToken;
exports.getLink = getLink;
exports.getAccessToken = getAccessToken;
