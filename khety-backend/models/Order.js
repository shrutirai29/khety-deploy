const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "Supply",
      trim: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    image: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Order must contain at least one item"
      }
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending"
    },
    gatewayOrderId: {
      type: String,
      required: true,
      unique: true
    },
    paymentReference: {
      type: String,
      default: ""
    },
    verificationHash: {
      type: String,
      default: ""
    },
    paidAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
