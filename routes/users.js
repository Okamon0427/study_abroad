const express = require('express');

const {
  userPage,
} = require('../controllers/users');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', isLoggedIn, userPage);

module.exports = router;