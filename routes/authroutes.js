
const express = require('express')
const { userSignUp, signIn } = require('../controllers/authController')

const router = express.Router()

router.post('/signup',userSignUp)
router.post('/signIn',signIn)



module.exports = router;