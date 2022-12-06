//Server Necessities
const express = require("express");
const router = express.Router();

const { check } = require("express-validator");
const checkAuth = require("../Middleware/auth");

const bankController = require("../Controllers/bank/bankController");

router.use(checkAuth);
router.get("/objectif", bankController.getObjectives);
router.post("/objectif", bankController.postObjectives);
router.delete("/objectif", bankController.deleteObjectif);

router.post("/getLink", bankController.getLink);
router.post("/getAccessToken", bankController.getAccessToken);
router.post("/getTransactionInfo", bankController.getTransactionInfo);
router.post("/getBalanceInfo", bankController.getBalanceInfo);

router.post("/exchangePktoAccessToken", bankController.exchangePktoAccessToken);

module.exports = router;
