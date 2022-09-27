const axios = require("axios");

const getLink = async (req, res, next) => {
  // TO IMPLEMENT
  //let { uderId } = req.body;
  let userId = "unique-per-user";
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

  if (!rep.data.link_token) {
    const error = new HttpError("Error trying get link", 500);
    return next(error);
  }

  res.status(200).json({ tokenLink: rep.data.link_token });
};

exports.getLink = getLink;
