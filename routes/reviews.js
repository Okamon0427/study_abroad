const express = require('express');
const { check } = require('express-validator');

const {
  createReview,
  updateReview
} = require('../controllers/reviews');
const { isLoggedIn } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/:schoolId/reviews',
  isLoggedIn,
  [
    check('title')
      .not()
      .isEmpty()
      .withMessage('Title should not be empty'),
    check('description')
      .isLength({ max: 500 })
      .withMessage('Description should be within 500 chars long'),
  ],
  createReview
);

router.put(
  '/:schoolId/reviews/:reviewId',
  isLoggedIn,
  [
    check('title')
      .not()
      .isEmpty()
      .withMessage('Title should not be empty'),
    check('description')
      .isLength({ max: 500 })
      .withMessage('Description should be within 500 chars long'),
  ],
  updateReview
);

module.exports = router;