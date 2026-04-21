const User = require("../models/User");
const { verifyAuthToken } = require("../utils/authToken");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const secret = process.env.AUTH_SECRET || "dev-auth-secret-change-me";
    const payload = verifyAuthToken(token, secret);
    const user = await User.findById(payload.sub).select("_id role accountStatus");

    if (!user || user.accountStatus === "deactivated") {
      return res.status(401).json({ error: "This account is deactivated" });
    }

    req.auth = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

module.exports = requireAuth;
