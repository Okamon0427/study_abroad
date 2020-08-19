const { validationResult } = require('express-validator');

const Review = require('../models/Review');
const School = require('../models/School');
const CustomError = require('../utils/CustomError');

exports.createReview = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);

    // check the user who is logging in has favorite of this school
    let isFavoriteUser;
    if (req.user) {
      isFavoriteUser = school.likes.some(favoriteUser => 
        favoriteUser.equals(req.user._id)
      );
    } else {
      isFavoriteUser = false
    }

    // Validate in case User who is logging in has already written Review to the School
    const reviews = await Review.find({ school: req.params.schoolId });
    const isUserHasReview = reviews.some(review => 
      review.user.toString() === req.user.id.toString()
    );
    if (reviews && isUserHasReview) {
      req.flash('error', 'You have already written review to this school');
      return res.redirect(`/schools/${req.params.schoolId}`);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const limitedReviews = await Review.find({ school: req.params.schoolId }).limit(3).populate('user');
      return res.status(422).render('schools/show', {
        error: errors.array()[0].msg,
        title: school.name,
        school,
        modal: 'schoolDelete',
        modalMessage: 'Do you really want to delete this school?',
        isFavoriteUser,
        isUserHasReview,
        reviews: limitedReviews
      });
    }
    
    req.body.user = req.user.id;
    req.body.school = req.params.schoolId 
  
    await Review.create(req.body)
    req.flash('success', 'Created new review!');
    res.redirect(`/schools/${req.params.schoolId}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.updateReview = async (req, res, next) => {
  // ミドルウェアでレビューの持ち主か判断
  
  try {
    const reviews = await Review.find({ school: req.params.schoolId });
    const school = await School.findById(req.params.schoolId);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      // check the user who is logging in has favorite of this school
      let isFavoriteUser;
      if (req.user) {
      isFavoriteUser = school.likes.some(favoriteUser => 
        favoriteUser.equals(req.user._id)
      );
      } else {
        isFavoriteUser = false
      }

      // Validate in case User who is logging in has already written Review to the School
      let isUserHasReview = false;
      if (req.user) {
        const reviews = await Review.find({ school: req.params.schoolId });
        isUserHasReview = reviews.some(review => 
          review.user.toString() === req.user.id.toString()
        );
      }

      const limitedReviews = await Review.find({ school: req.params.schoolId }).limit(3).populate('user');

      return res.status(422).render('schools/show', {
        error: errors.array()[0].msg,
        title: school.name,
        school,
        modal: 'schoolDelete',
        modalMessage: 'Do you really want to delete this school?',
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
}