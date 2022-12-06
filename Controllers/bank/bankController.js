const axios = require("axios");
const HttpError = require("../../Model/util/httpErr");
const { validationResult } = require("express-validator");
const Mongoose = require("mongoose");
const User = require("../../Model/user");
const Objectif = require("../../Model/objectif");
const dateFormat = require("dateformat");

const getTransactionInfo = async (req, res, next) => {
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

  const user = await User.findById(userId);
  if (!user) return next(new HttpError("User Not Found", 422));
  if (!user.userBankToken)
    return next(new HttpError("Not Found BankToken", 422));

  const url = process.env.PLAID_URL_GETINFO;
  const now = new Date();
  const nowminus1 = new Date();
  nowminus1.setFullYear(nowminus1.getFullYear() - 1);
  // Basic usage
  const nowFormated = dateFormat(now, "yyyy-mm-dd");
  const nowminusFormated = dateFormat(nowminus1, "yyyy-mm-dd");
  console.log(nowFormated);

  const json = {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    access_token: user.userBankToken,
    start_date: nowminusFormated,
    end_date: nowFormated,
    options: {
      count: 500,
      offset: 0,
    },
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
  console.log(rep.data);

  if (!rep || !rep.data) {
    const error = new HttpError("Error trying get data", 500);
    return next(error);
  }

  res.status(200).json({ data: rep.data });
};
const getBalanceInfo = async (req, res, next) => {
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

  const user = await User.findById(userId);
  if (!user) return next(new HttpError("User Not Found", 422));
  if (!user.userBankToken)
    return next(new HttpError("Not Found BankToken", 422));

  const url = process.env.PLAID_URL_GETBALANCE;

  const json = {
    client_id: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    access_token: user.userBankToken,
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
  console.log(rep.data);

  if (!rep || !rep.data) {
    const error = new HttpError("Error trying get data", 500);
    return next(error);
  }

  res.status(200).json({ data: rep.data });
};
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

const getObjectives = async (req, res, next) => {
  let userId = req.user.id;
  console.log(userId);

  const objectives = await Objectif.find({ userId: userId });

  if (!objectives) return next(new HttpError("objectives Not Found", 422));

  res.status(200).json({
    objectives: objectives.map((el) => el.toObject({ getters: true })),
  });
};

const postObjectives = async (req, res, next) => {
  let userId = req.user.id;
  console.log(userId);
  let { startDate, endDate, category, amount } = req.body;
  if (
    !startDate ||
    !endDate ||
    !category ||
    !Array.isArray(category) ||
    !amount
  ) {
    const error = new HttpError("Bad input", 500);
    return next(error);
  }
  let objectif = new Objectif({
    userId: userId,
    startDate: startDate,
    endDate: endDate,
    category: category,
    amount: amount,
  });

  const sess = await Mongoose.startSession();
  try {
    sess.startTransaction();
    await objectif.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    await sess.abortTransaction();
    const error = new HttpError("Error saving objectif", 500);
    return next(error);
  }
  res.status(200).json({
    objectif: objectif.toObject({ getters: true }),
  });
};

const deleteObjectif = async (req, res, next) => {
  let userId = req.user.id;
  console.log(userId);
  let { objId } = req.body;
  if (!objId) {
    const error = new HttpError("Bad input", 500);
    return next(error);
  }

  const sess = await Mongoose.startSession();
  try {
    sess.startTransaction();
    await Objectif.deleteOne({ _id: objId, userId: userId }, { session: sess });
    await sess.commitTransaction();
  } catch (err) {
    await sess.abortTransaction();
    const error = new HttpError("Error deleting objectif", 500);
    return next(error);
  }
  res.status(200).json({
    status: "deleted",
  });
};
exports.deleteObjectif = deleteObjectif;

exports.postObjectives = postObjectives;
exports.getObjectives = getObjectives;
exports.exchangePktoAccessToken = exchangePktoAccessToken;
exports.getLink = getLink;
exports.getAccessToken = getAccessToken;
exports.getTransactionInfo = getTransactionInfo;
exports.getBalanceInfo = getBalanceInfo;
