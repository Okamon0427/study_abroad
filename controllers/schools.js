const { validationResult } = require('express-validator');

const School = require('../models/School');
const Review = require('../models/Review');
const CustomError = require('../utils/CustomError');
const { deleteFile } = require('../utils/deleteFile');

exports.getSchools = async (req, res, next) => {
  try {
    const schools = await School.find().populate('reviews');

    res.render('schools/schools', {
      schools,
      title: 'Schools',
    });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.newSchool = async (req, res, next) => {
  res.render('schools/new', {
    title: 'Add New School',
    formContent: 'addSchool'
  });
};

exports.createSchool = async (req, res, next) => {
  const school = req.body
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('schools/new', {
      title: 'Add New School',
      error: errors.array()[0].msg,
      school,
      formContent: 'addSchool'
    });
  }

  const existingSchool = await School.findOne({ name: req.body.name });
  if (existingSchool) {
    return res.status(401).render('schools/new', {
      title: 'Add New School',
      error: 'This school has already been registered',
      formContent: 'addSchool',
      school
    });
  }

  req.body.user = req.user.id;
  if (req.file) {
    req.body.image = req.file.path;
  }

  try {
    await School.create(req.body);
    req.flash('success', 'Created new school!');
    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId).populate('reviews');
    const reviews = await Review.find({ school: req.params.schoolId });

    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    // check the user who is logging in has favorite of this school (true or false)
    const isFavoriteUser = checkIsFavoriteUser(req, school);

    // check the user who is logging in has already written Review to the School
    const isUserHasReview = checkIsUserHasReview(req, reviews);

    const limitedReviews = await Review.find({ school: req.params.schoolId }).limit(3).populate('user');

    res.render('schools/show', {
      title: school.name,
      school,
      isFavoriteUser,
      isUserHasReview,
      reviews: limitedReviews
    });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.favoriteSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    // change Favorite Button if the user who is logging in has favorite of this school
    const isFavoriteUser = checkIsFavoriteUser(req, school);
    if (isFavoriteUser) {
      school.likes.pull(req.user._id);
    } else {
      school.likes.push(req.user);
    }

    await school.save();
    return res.redirect(`/schools/${school._id}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.editSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);

    res.render('schools/edit', {
      school,
      title: 'Edit school',
      formContent: 'editSchool'
    });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.updateSchool = async (req, res, next) => {
  const _id = req.params.schoolId
  let school = { ...req.body, _id }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('schools/edit', {
      title: 'Edit School',
      error: errors.array()[0].msg,
      school,
      formContent: 'editSchool'
    });
  }
  
  try {
    school = await School.findById(req.params.schoolId);
    
    if (req.file) {
      if (school.image !== 'uploads\\no-photo.jpg') {
        deleteFile(school.image);
      }
      req.body.image = req.file.path;
    }

    await School.findByIdAndUpdate(req.params.schoolId, req.body, {
      new: true,
      runValidators: true
    });

    req.flash('success', 'Editted product!');
    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.deleteSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    
    if (school.image !== 'uploads\\no-photo.jpg') {
      deleteFile(school.image);
    }

    await school.remove();

    req.flash('success', 'Deleted school!');
    res.redirect('/schools');
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
  if (req.user) {
    return reviews.some(review => 
      review.user.equals(req.user._id)
    );
  } else {
    return false;
  }
};