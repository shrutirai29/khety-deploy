const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "de0d9otpq",
  api_key: process.env.CLOUDINARY_API_KEY || "612187928413993",
  api_secret: process.env.CLOUDINARY_API_SECRET || "0PHQOX-gu-GCjhSalBdknpZbIPQ",
});

module.exports = cloudinary;