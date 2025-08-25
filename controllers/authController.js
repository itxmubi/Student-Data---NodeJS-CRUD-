const db = require("../config/db");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require('bcryptjs');

const express = require('express');
const mysql = require('mysql2');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
const crypto = require('crypto');

function isvalidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidPassword(password) {
return typeof password === "string" && password.length >= 8;
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

async function revokeRefreshToken(rawToken) {
  const tokenHash = sha256Hex(rawToken);
  await db.query(`UPDATE Refresh_tokens SET revoked=1 WHERE token_hash=>?`, [
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
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = { id: parseInt(payload.sub, 10), email: payload.email };
    next();
  } catch (e) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid/expired access token" });
  }
}

//Sign Up Api
userSignUp =  async (req, res) => {
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

    const password_hash = await bcrypt.hash(password,12);
     const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );


    const user = {id: result.insertId, name , email}
    const accessToken = signAccessToken(user);
    const refreshToken = generateOpaqueToken();
    await saveRefreshToken(user.id, refreshToken)

     return res.status(201).send({
      success: true,
      message: 'Account created',
      user,
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
     console.error(error);
    return res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
  }
};


module.exports = {userSignUp}
