const express = require('express');

const {
  getUser,
  editUser,
  updateUser
} = require('../controllers/users');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', isLoggedIn, getUser);

router.get('/:userId/edit', isLoggedIn, editUser);

router.put('/:userId', isLoggedIn, updateUser);

module.exports = router;