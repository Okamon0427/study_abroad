const express = require('express');
const { check, oneOf } = require('express-validator');

const {
  getUser,
  editUser,
  updateUser
} = require('../controllers/users');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', isLoggedIn, getUser);

router.get('/:userId/edit', isLoggedIn, editUser);

// router.put(
//   '/:userId',
//   isLoggedIn,
//   [
//     check('name')
//       .not()
//       .isEmpty()
//       .withMessage('Name should not be empty')
//   ],
//   updateUser
// );
router.put(
  '/:userId',
  isLoggedIn,
  oneOf([
    check('name')
      .exists()
      .not()
      .isEmpty()
      .withMessage('Name should not be empty'),
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

module.exports = router;