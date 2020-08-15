const express = require('express');

const userController = require('../controllers/users');

const router = express.Router();

router.get('/signup', userController.signupPage);

router.post('/signup', userController.signup);

router.get('/login', userController.loginPage);

router.post('/login', userController.login);

router.get('/logout', userController.logout);

module.exports = router;