const School = require("../models/School");

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