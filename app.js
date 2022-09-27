//Server requirement
const express = require("express");
const bodyParser = require("body-parser");

//Custom Error
const HttpError = require("./Model/util/httpErr");

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  next();
});

const bankroutes = require("./Routes/bankRoutes");

app.use("/bank/", bankroutes);

app.use((req, res, next) => {
  const error = new HttpError("Could note find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.method === "OPTIONS") {
    console.log("a preflight request has been sent");
    return res.status(200).end();
  }
  console.log(error.message);
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknow error appears" });
});

app.listen(process.env.PORT || 5001);
