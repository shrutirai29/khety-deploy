const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["farmer", "owner"],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  birthdate: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    default: "",
    trim: true
  },
  occupation: {
    type: String,
    default: "",
    trim: true
  },
  preferredLanguage: {
    type: String,
    default: "",
    trim: true
  },
  farmSize: {
    type: String,
    default: "",
    trim: true
  },
  primaryCrops: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    default: "",
    trim: true
  },
  bio: {
    type: String,
    default: "",
    trim: true
  },
  address: {
    type: String,
    default: "",
    trim: true
  },
  emergencyContactName: {
    type: String,
    default: "",
    trim: true
  },
  emergencyContactPhone: {
    type: String,
    default: "",
    trim: true
  },
  accountStatus: {
    type: String,
    enum: ["active", "deactivated"],
    default: "active"
  },
  deactivatedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
