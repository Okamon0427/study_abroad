const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const bcrypt = require('bcryptjs');
const passport = require('passport');

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
        error: 'This email has already been registered',
        name,
        email,
        password
      });
    }

    if (password !== confirmPassword) {
      return res.status(401).render('users/signup', {
        title: 'Signup',
        error: 'Confirm password failed',
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

    req.flash('success', 'Successfully registererd!');
    res.redirect('/login');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.loginPage = (req, res, next) => {
  res.render('users/login', { title: 'Login' });
};

exports.login = (req, res, next) => {
  passport.authenticate('local',
    {
      successRedirect: '/schools',
      failureRedirect: '/login',
      successFlash: 'Welcome!',
      failureFlash: 'Invalid username or password.'
    }
  )(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/schools');
};