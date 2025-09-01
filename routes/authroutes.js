const express = require("express");
const {
  userSignUp,
  signIn,
  authRequired,
  userData,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", userSignUp);
router.post("/signIn", signIn);
router.get("/userData", authRequired, userData);

module.exports = router;
