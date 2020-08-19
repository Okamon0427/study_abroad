const express = require('express');
const { check } = require('express-validator');

const {
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthorized } = require('../middleware/auth');

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
  isReviewAuthorized,
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

router.delete(
  '/:schoolId/reviews/:reviewId',
  isLoggedIn,
  isReviewAuthorized,
  deleteReview
);

module.exports = router;