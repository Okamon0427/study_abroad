const School = require("../models/School");
const Review = require("../models/Review");
const User = require('../models/User');

const CustomError = require('../utils/CustomError');

exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
  }
  req.flash('error', 'Please log in to view that resource');
	res.redirect("/login");
};

exports.isSchoolAuthorized = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
  
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }
  
    if (school.user.toString() !== req.user._id.toString()) {
      req.flash('error', 'You are not authorized to do that');
      return res.redirect('/schools');
    }
  
    next();
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.isReviewAuthorized = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    const review = await Review.findById(req.params.reviewId);
  
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    if (!review) {
      const error = new CustomError('Review not found', 404);
      return next(error);
    }
  
    if (review.user.toString() !== req.user._id.toString()) {
      req.flash('error', 'You are not authorized to do that');
      return res.redirect(`/schools/${req.params.schoolId}`);
    }
  
    next();
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.isUserAuthorized = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      const error = new CustomError('User not found', 404);
      return next(error);
    }

    if (user._id.toString() !== req.user._id.toString()) {
      req.flash('error', 'You are not authorized to do that');
      return res.redirect(`/users/${user._id}`);
    }

    next();
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};