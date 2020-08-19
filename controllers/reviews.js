const { validationResult } = require('express-validator');

const Review = require('../models/Review');
const School = require('../models/School');
const CustomError = require('../utils/CustomError');

exports.createReview = async (req, res, next) => {
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

    return res.status(422).render('schools/show', {
      error: errors.array()[0].msg,
      title: school.name,
      school,
      modal: 'schoolDelete',
      modalMessage: 'Do you really want to delete this school?',
      isFavoriteUser,
      isUserHasReview
    });
  }
  
  req.body.user = req.user.id;
  req.body.school = req.params.schoolId 
  
  try {
    await Review.create(req.body)
    req.flash('success', 'Created new review!');
    res.redirect(`/schools/${req.params.schoolId}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};