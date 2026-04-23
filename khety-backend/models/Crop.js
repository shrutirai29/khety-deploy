const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: String,
    senderName: String,
    senderRole: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const buyerRequestSchema = new mongoose.Schema(
  {
    ownerId: String,
    ownerName: String,
    ownerPhone: String,
    ownerEmail: String,
    ownerLocation: String,
    requestType: {
      type: String,
      default: "chat"
    },
    message: String,
    farmerResponse: String,
    farmerConfirmed: {
      type: Boolean,
      default: false
    },
    ownerConfirmed: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: "pending"
    },
    chatMessages: [chatMessageSchema],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    reopenReason: {
      type: String,
      default: ""
    },
    reopenedByRole: {
      type: String,
      default: ""
    },
    reopenedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    price: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    quantity: {
      type: String,
      default: "",
      trim: true
    },
    unit: {
      type: String,
      default: "quintal",
      trim: true
    },
    notes: {
      type: String,
      default: "",
      trim: true
    },
    availability: {
      type: String,
      default: "Immediate",
      trim: true
    },
    listingStatus: {
      type: String,
      default: "active",
      trim: true
    },
    farmerId: String,
    farmerName: String,
    interestedBuyers: [buyerRequestSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
