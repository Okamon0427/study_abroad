const { validationResult } = require('express-validator');

const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const sendEmail = require('../utils/sendEmail');

exports.newInquiry = (req, res, next) => {
  res.render('others/inquiry', {
    title: 'Inquiry',
    formContent: 'inquiry'
  });
};

exports.sendInquiry = async (req, res, next) => {
  const { name, email, inquiry } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('others/inquiry', {
      error: errors.array()[0].msg,
      title: 'Inquiry',
      formContent: 'inquiry',
      name,
      email,
      inquiry
    });
  }

  try {
    // if user exists, save user information into Inquiry model
    const user = await User.findOne({ email });
    if (user) {
      const isRegisteredUser = true;
    }
  
    req.flash('success', 'Inquiry sent to our team successfully!');
    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};