const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const bcrypt = require('bcryptjs');

exports.signupPage = (req, res, next) => {
  res.render('users/signup', { title: 'Signup' });
};

exports.signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).render('users/signup', {
        title: 'Signup',
        name,
        email,
        password
      });
    }

    if (password !== confirmPassword) {
      return res.status(401).render('users/signup', {
        title: 'Signup',
        name,
        email,
        password
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();

    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};