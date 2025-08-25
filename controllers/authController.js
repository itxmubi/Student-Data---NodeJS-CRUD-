const db = require("../config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");

function isvalidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function sha256Hex(s) {
  if (!s) throw new Error("sha256Hex: input is required");
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}

function generateOpaqueToken() {
return crypto.randomBytes(64).toString("hex");
}

function signAccessToken(user) {
  return (
    jwt.sign({
      sub: String(user.id),
      email:user.email},
      process.env.ACCESS_TOKEN_SECRET,
     { expiresIn:  process.env.ACCESS_TOKEN_TTL }
    
  ));
}

async function saveRefreshToken(userid, rawToken) {
  const tokenHash = sha256Hex(String(rawToken));
  console.log(`Values are ${userid}, ${tokenHash}, ${process.env.REFRESH_TOKEN_TTL_DAYS}`,)
  const [rows] = await db.query(
   `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
   VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY))`,
    [userid, tokenHash, process.env.REFRESH_TOKEN_TTL_DAYS]
  );
  return rows.insertId;
}

async function revokeRefreshToken(rawToken) {
  const tokenHash = sha256Hex(rawToken);
  await db.query(`UPDATE refresh_tokens SET revoked=1 WHERE token_hash=?`, [
    tokenHash,
  ]);
  return row[0];
}

async function findRefreshToken(rawToken) {
  const tokenHash = sha256Hex(rawToken);
  const [rows] = await db.query(
    `SELECT * FROM refresh_tokens WHERE token_hash=? LIMIT 1`,
    [tokenHash]
  );
  return rows[0];
}

async function rotateRefreshToken(oldRawToken, userId) {
  // revoke old
  await revokeRefreshToken(oldRawToken);
  //generate new
  const newRaw = generateOpaqueToken();
  await saveRefreshToken(userId, newRaw);
  return newRaw;
}
// --- Auth middleware ---

async function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Missing access token" });
    const payload = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: parseInt(payload.sub, 10), email: payload.email };
    next();
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid/expired access token" });
  }
}

//Sign Up Api
userSignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).send({
        success: false,
        message: "name, email, password are required",
      });

    if (!isvalidEmail) {
      return res.status(400).send({ success: false, message: "Invalid email" });
    }
    if (!isValidPassword(password)) {
      return res
        .status(400)
        .send({ success: false, message: "Password must be at least 8 chars" });
    }

    //check Duplicate email
    const [exist] = await db.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    if (exist.length > 0) {
      return res
        .status(409)
        .send({ success: false, message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );

    const user = { id: result.insertId, name, email };
    const accessToken = signAccessToken(user);
    const refreshToken = generateOpaqueToken();
    await saveRefreshToken(user.id, refreshToken);

    return res.status(201).send({
      success: true,
      message: "Account created",
      user,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Signup failed", error: error.message });
  }
};

signIn = async (req, res) => {
  try{
  const { email, password } = req.body || {};
  console.log("Signup input:", req.body); 
  if (!email || !password) {
    return res
      .status(400)
      .send({ success: false, message: "email and password are required" });
  }

  const [rows] = await db.query(
    `SELECT id, name, email,password_hash FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  const user = rows[0];
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await db.query(`UPDATE users SET last_login_at = UTC_TIMESTAMP() where id = ? `, [user.id])


    const safeUser = {id: user.id, name: user.name, email: user.email};
    const accessToken = signAccessToken(safeUser)
    const refresh_token = generateOpaqueToken();
    await  saveRefreshToken(user.id,refresh_token);


     return res.status(200).json({
      success: true,
      message: 'Logged in',
      user: safeUser,
      tokens: { accessToken, refresh_token }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }



};

module.exports = { userSignUp, signIn };
