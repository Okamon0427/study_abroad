const express = require('express');
const { check, oneOf } = require('express-validator');

const {
  getUser,
  editUser,
  updateUser,
  deleteUser
} = require('../controllers/users');
const { isLoggedIn, isUserAuthorized } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', isLoggedIn, getUser);

router.get('/:userId/edit', isLoggedIn, isUserAuthorized, editUser);

router.put(
  '/:userId',
  isLoggedIn,
  isUserAuthorized,
  oneOf([
    [
      check('name')
        .exists()
        .not()
        .isEmpty()
        .withMessage('Name should not be empty'),
      check('introduction')
        .exists()
        .isLength({ max: 500 })
        .withMessage('Introduction should be within 500 chars long'),
      check('english')
        .exists()
        .isLength({ max: 100 })
        .withMessage('English (current level or target) should be within 100 chars long')
    ],
    check('newEmail')
      .exists()
      .normalizeEmail()
      .isEmail()
      .withMessage('invalid email address'),
    check('newPassword')
      .exists()
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 chars long')
  ]),
  updateUser
);

router.delete('/:userId', isLoggedIn, isUserAuthorized, deleteUser);

module.exports = router;