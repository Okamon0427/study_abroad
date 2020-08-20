const { validationResult } = require('express-validator');

const Review = require('../models/Review');
const School = require('../models/School');
const CustomError = require('../utils/CustomError');

exports.createReview = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    const reviews = await Review.find({ school: req.params.schoolId });

    // Validate in case User who is logging in has already written Review to the School
    const isUserHasReview = checkIsUserHasReview(req, reviews);
    if (isUserHasReview) {
      req.flash('error', 'You have already written review to this school');
      return res.redirect(`/schools/${req.params.schoolId}`);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // check the user who is logging in has favorite of this school (true or false)
      const isFavoriteUser = checkIsFavoriteUser(req, school);

      const limitedReviews = await Review.find({ school: req.params.schoolId }).limit(3).populate('user');
      return res.status(422).render('schools/show', {
        error: errors.array()[0].msg,
        title: school.name,
        school,
        isFavoriteUser,
        isUserHasReview,
        reviews: limitedReviews
      });
    }

    req.body.user = req.user.id;
    req.body.school = req.params.schoolId;

    await Review.create(req.body);

    req.flash('success', 'Created new review!');
    res.redirect(`/schools/${req.params.schoolId}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    const reviews = await Review.find({ school: req.params.schoolId });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      // check the user who is logging in has favorite of this school (true or false)
      const isFavoriteUser = checkIsFavoriteUser(req, school);

      // check the user who is logging in has already written Review to the School
      const isUserHasReview = checkIsUserHasReview(req, reviews);

      const limitedReviews = await Review.find({ school: req.params.schoolId }).limit(3).populate('user');
      return res.status(422).render('schools/show', {
        error: errors.array()[0].msg,
        title: school.name,
        school,
        isFavoriteUser,
        isUserHasReview,
        reviews: limitedReviews
      });
    }

    await Review.findByIdAndUpdate(req.params.reviewId, req.body, {
      new: true,
      runValidators: true
    });

    req.flash('success', 'Editted review!');
    res.redirect(`/schools/${req.params.schoolId}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);

    req.flash('success', 'Deleted review!');
    res.redirect(`/schools/${req.params.schoolId}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

const checkIsFavoriteUser = (req, school) => {
  if (req.user) {
    return school.likes.some(favoriteUser => 
      favoriteUser.equals(req.user._id)
    );
  } else {
    return false;
  }
};

const checkIsUserHasReview = (req, reviews) => {
  return reviews.some(review => 
    review.user.equals(req.user._id)
  );
};