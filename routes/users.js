const express = require('express');

const userController = require('../controllers/users');

const router = express.Router();

router.get('/signup', userController.signupPage);

router.post('/signup', userController.signup);

module.exports = router;