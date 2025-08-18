const db = require("../config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

function isvalidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidPassword(password) {
  return typeof pw === "string" && pw.length >= 8;
}

function sha256Hex(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function generateOpaqueToken() {
  crypto.randomBytes("64").toString("hex");
}

function signAccessToken(user) {
  return (
    jwt.sign({
      sub: string(user.id),
      email: string(user.email),
    }),
    dotenv.process.ACCESS_TOKEN_SECRET,
    { expiresIn: dotenv.process.ACCESS_TOKEN_TTL }
  );
}

async function saveRefreshToken(userid, rawToken) {
  const tokenHash = sha256Hex(rawToken);
  const [rows] = await db.query(
    `INSERT into refresh_token (userId, token_hash, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY)`,
    [userId, tokenHash, REFRESH_TOKEN_TTL_DAYS]
  );
  return rows.insertId;
}
