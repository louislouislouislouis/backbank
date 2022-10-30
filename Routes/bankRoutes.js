//Server Necessities
const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
const checkAuth = require("../Middleware/auth");

const bankController = require("../Controllers/bank/bankController");

router.use(checkAuth);
router.post("/getLink", bankController.getLink);
router.post("/getAccessToken", bankController.getAccessToken);

router.post("/exchangePktoAccessToken", bankController.exchangePktoAccessToken);

module.exports = router;
