const School = require('../models/School');
const CustomError = require('../utils/CustomError');

exports.getSchools = async (req, res, next) => {
  try {
    const schools = await School.find();
    res.render('schools/schools', { schools });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.newSchool = (req, res, next) => {
  res.render('schools/new');
};

exports.createSchool = async (req, res, next) => {
  try {
    await School.create(req.body);
    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);

    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    res.render('schools/show', { school });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.editSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    res.render('schools/edit', { school });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.updateSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    const updatedSchool = await School.findByIdAndUpdate(req.params.schoolId, req.body, {
      new: true,
      runValidators: true
    });

    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.deleteSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    await School.findByIdAndDelete(req.params.schoolId);

    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};