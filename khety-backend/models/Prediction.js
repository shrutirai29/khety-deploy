const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  userId: String,
  image: String,
  result: String,
  confidence: Number,

  // ✅ THIS IS THE MAIN FIX
  report: {
    problem: String,
    cause: String,
    symptoms: String,
    damage: String,
    solution: String
  }

}, { timestamps: true }); // ✅ for date

module.exports = mongoose.model("Prediction", predictionSchema);