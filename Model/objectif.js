const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ObjectifModel = new Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  category: [{ type: String, required: true }],
  amount: { type: Number, required: true },
});

module.exports = mongoose.model("Objectif", ObjectifModel);
