const crypto = require("crypto");
const { promisify } = require("util");
const express = require("express");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { createAuthToken } = require("../utils/authToken");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const scryptAsync = promisify(crypto.scrypt);

const otpStore = {};
const resetTokens = {};
const requestTracker = new Map();

const canSendEmail =
  process.env.MAIL_USER &&
  process.env.MAIL_PASS &&
  process.env.MAIL_FROM;

const transporter = canSendEmail
  ? nodemailer.createTransport({
      service: process.env.MAIL_SERVICE || "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    })
  : null;

const sendMailOrLog = async ({ to, subject, text }) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text
      });
      return "sent";
    } catch (err) {
      console.error("[mail-error]", err);
    }
  }

  console.log(`[mail-disabled] To: ${to}`);
  console.log(`[mail-disabled] Subject: ${subject}`);
  console.log(`[mail-disabled] Body: ${text}`);
  return "logged";
};

const normalizeEmail = (value = "") => value.trim().toLowerCase();
const normalizeText = (value = "") => value.trim();
const normalizeArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => normalizeText(item)).filter(Boolean)
    : String(value || "")
        .split(",")
        .map((item) => normalizeText(item))
        .filter(Boolean);
const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  location: user.location,
  birthdate: user.birthdate,
  gender: user.gender || "",
  occupation: user.occupation || "",
  preferredLanguage: user.preferredLanguage || "",
  farmSize: user.farmSize || "",
  primaryCrops: user.primaryCrops || [],
  experienceLevel: user.experienceLevel || "",
  bio: user.bio || "",
  address: user.address || "",
  emergencyContactName: user.emergencyContactName || "",
  emergencyContactPhone: user.emergencyContactPhone || "",
  profileImage: user.profileImage || "",
  accountStatus: user.accountStatus || "active",
  deactivatedAt: user.deactivatedAt || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const isStrongPassword = (password = "") =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

const createRateLimiter = ({ windowMs, maxRequests, keyResolver }) => (req, res, next) => {
  const now = Date.now();
  const key = keyResolver(req);
  const entry = requestTracker.get(key);

  if (!entry || now > entry.expiresAt) {
    requestTracker.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });
    return next();
  }

  if (entry.count >= maxRequests) {
    return res.status(429).json({
      error: "Too many requests. Please wait a moment and try again."
    });
  }

  entry.count += 1;
  return next();
};

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  keyResolver: (req) => `auth:${req.ip}:${req.path}`
});

router.use(authRateLimiter);

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
};

const verifyPassword = async (password, storedValue) => {
  if (!storedValue?.startsWith("scrypt:")) {
    return password === storedValue;
  }

  const [, salt, hash] = storedValue.split(":");
  const derivedKey = await scryptAsync(password, salt, 64);
  const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
  const storedBuffer = Buffer.from(hash, "hex");

  if (derivedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
};

router.post("/send-otp", async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore[email] = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    const mailStatus = await sendMailOrLog({
      to: email,
      subject: "Khety OTP Verification",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    });

    res.json({
      message: mailStatus === "sent" ? "OTP sent to email" : "OTP generated in server logs"
    });
  } catch (err) {
    console.error("[send-otp-error]", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = normalizeText(req.body.otp);
  const entry = otpStore[email];

  if (!entry) {
    return res.json({ success: false });
  }

  if (Date.now() > entry.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false });
  }

  if (entry.code === otp) {
    delete otpStore[email];
    return res.json({ success: true });
  }

  res.json({ success: false });
});

router.post("/register", async (req, res) => {
  const payload = {
    name: normalizeText(req.body.name),
    email: normalizeEmail(req.body.email),
    phone: normalizeText(req.body.phone),
    password: req.body.password || "",
    role: req.body.role,
    location: normalizeText(req.body.location),
    birthdate: normalizeDate(req.body.birthdate),
    gender: normalizeText(req.body.gender),
    occupation: normalizeText(req.body.occupation),
    preferredLanguage: normalizeText(req.body.preferredLanguage),
    farmSize: normalizeText(req.body.farmSize),
    primaryCrops: normalizeArray(req.body.primaryCrops),
    experienceLevel: normalizeText(req.body.experienceLevel),
    bio: normalizeText(req.body.bio),
    address: normalizeText(req.body.address),
    emergencyContactName: normalizeText(req.body.emergencyContactName),
    emergencyContactPhone: normalizeText(req.body.emergencyContactPhone)
  };

  if (!payload.name || !payload.email || !payload.phone || !payload.role || !payload.location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["farmer", "owner"].includes(payload.role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  if (!isStrongPassword(payload.password)) {
    return res.status(400).json({
      error: "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    });
  }

  try {
    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(payload.password);
    const user = new User({
      ...payload,
      password: hashedPassword
    });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("[register-error]", err);
    res.status(500).json({ error: "Unable to register user" });
  }
});

router.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password || "";

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.accountStatus === "deactivated") {
      return res.status(403).json({ error: "This account has been deactivated." });
    }

    const storedPassword = typeof user.password === "string" ? user.password : "";
    const isValidPassword = await verifyPassword(password, storedPassword);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (storedPassword && !storedPassword.startsWith("scrypt:")) {
      user.password = await hashPassword(password);
      await user.save();
    }

    res.json({
      message: "Login successful",
      user: sanitizeUser(user),
      token: createAuthToken(
        user,
        process.env.AUTH_SECRET || "dev-auth-secret-change-me"
      )
    });
  } catch (err) {
    console.error("[login-error]", err);
    res.status(500).json({ error: "Unable to log in" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      resetTokens[token] = {
        email,
        expiresAt: Date.now() + 30 * 60 * 1000
      };

      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/reset-password/${token}`;

      const mailStatus = await sendMailOrLog({
        to: email,
        subject: "Reset Password",
        text: `Click here to reset password: ${resetLink}`
      });

      if (mailStatus !== "sent") {
        console.log(`[reset-link] ${resetLink}`);
      }
    }

    res.json({
      message: transporter
        ? "If the account exists, a reset link has been sent."
        : "If the account exists, a reset link has been generated in server logs."
    });
  } catch (err) {
    console.error("[forgot-password-error]", err);
    res.status(500).json({ error: "Failed to start password reset" });
  }
});

router.post("/reset-password", async (req, res) => {
  const token = normalizeText(req.body.token);
  const password = req.body.password || "";
  const tokenEntry = resetTokens[token];

  if (!tokenEntry || Date.now() > tokenEntry.expiresAt) {
    delete resetTokens[token];
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    });
  }

  try {
    const user = await User.findOne({ email: tokenEntry.email });

    if (!user) {
      delete resetTokens[token];
      return res.status(404).json({ error: "User not found" });
    }

    user.password = await hashPassword(password);
    await user.save();
    delete resetTokens[token];

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("[reset-password-error]", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Unable to load profile" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates = {
      name: normalizeText(req.body.name) || user.name,
      phone: normalizeText(req.body.phone) || user.phone,
      location: normalizeText(req.body.location) || user.location,
      birthdate: normalizeDate(req.body.birthdate),
      gender: normalizeText(req.body.gender),
      occupation: normalizeText(req.body.occupation),
      preferredLanguage: normalizeText(req.body.preferredLanguage),
      farmSize: normalizeText(req.body.farmSize),
      primaryCrops: normalizeArray(req.body.primaryCrops),
      experienceLevel: normalizeText(req.body.experienceLevel),
      bio: normalizeText(req.body.bio),
      address: normalizeText(req.body.address),
      emergencyContactName: normalizeText(req.body.emergencyContactName),
      emergencyContactPhone: normalizeText(req.body.emergencyContactPhone),
      profileImage: normalizeText(req.body.profileImage)
    };

    Object.assign(user, updates);
    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to update profile" });
  }
});

router.patch("/deactivate", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.accountStatus = "deactivated";
    user.deactivatedAt = new Date();
    await user.save();

    res.json({ message: "Account deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Unable to deactivate account" });
  }
});

module.exports = router;
