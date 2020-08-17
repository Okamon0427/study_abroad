const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const CustomError = require('../utils/CustomError');

exports.signupPage = (req, res, next) => {
  res.render('auth/signup', {
    title: 'Signup',
    formContent: 'signup'
  });
};

exports.signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      title: 'Signup',
      error: errors.array()[0].msg,
      name,
      email,
      password,
      formContent: 'signup'
    });
  }

  try {
    const existingUserName = await User.findOne({ name });
    const existingUserEmail = await User.findOne({ email });

    if (existingUserName) {
      return res.status(401).render('auth/signup', {
        title: 'Signup',
        error: 'This username has already been registered',
        name,
        email,
        password,
        formContent: 'signup'
      });
    }

    if (existingUserEmail) {
      return res.status(401).render('auth/signup', {
        title: 'Signup',
        error: 'This email has already been registered',
        name,
        email,
        password,
        formContent: 'signup'
      });
    }

    if (password !== confirmPassword) {
      return res.status(401).render('auth/signup', {
        title: 'Signup',
        error: 'Confirm password failed',
        name,
        email,
        password,
        formContent: 'signup'
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
  res.render('auth/login', {
    title: 'Login',
    formContent: 'login'
  });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      title: 'Login',
      error: errors.array()[0].msg,
      email,
      password,
      formContent: 'login'
    });
  }

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