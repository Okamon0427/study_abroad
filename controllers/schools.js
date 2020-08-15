const School = require('../models/School');
const CustomError = require('../utils/CustomError');

exports.getSchools = async (req, res, next) => {
  try {
    const schools = await School.find();
    res.render('schools/schools', {
      schools,
      title: 'Schools',
      page: 'schools'
    });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.newSchool = (req, res, next) => {
  res.render('schools/new', { title: 'Add New School'});
};

exports.createSchool = async (req, res, next) => {
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
    const school = await School.findById(req.params.schoolId);

    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    res.render('schools/show', { school, title: school.name });
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

    res.render('schools/edit', { school, title: 'Edit school' });
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
    
    if (!school) {
      const error = new CustomError('School not found', 404);
      return next(error);
    }

    await School.findByIdAndDelete(req.params.schoolId);

    req.flash('success', 'Deleted product!');
    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};