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

exports.getForgotPassword = (req, res, next) => {
  res.render('auth/forgot', {
    title: 'Forget Password',
    formContent: 'forgotPassword'
  });
};

exports.postForgotPassword = async (req, res, next) => {
  try {
    // check user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash('error', 'No account with that email address exists.');
      return res.redirect('/forgot');
    }

    // produce token and save it
    const token = bcrypt.hashSync('bacon', 8);
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    user.save();

    // メールを送信する

    req.flash('success', 'Message sent to your email address. Check the email and reset password');
    res.redirect('/schools');
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.getResetPassword = async (req, res, next) => {
  try {
    // check token and expire date
    const user = await User.findOne({
      resetPasswordToken: req.params.passwordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect("/forgot");
    }

    res.render('auth/reset', {
      title: 'Change Password',
      formContent: 'resetPassword',
      token: req.params.passwordToken
    });

  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.putResetPassword = async (req, res, next) => {
  // check token and expire date
  const user = await User.findOne({
    resetPasswordToken: req.params.passwordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired');
    return res.redirect("/forgot");
  }

  // check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/reset', {
      title: 'Change Password',
      formContent: 'resetPassword',
      token: req.params.passwordToken,
      error: errors.array()[0].msg,
    });
  }

  // compare password and confirm password
  const { newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(401).render('auth/reset', {
      title: 'Change Password',
      formContent: 'resetPassword',
      token: req.params.passwordToken,
      error: 'Confirm password failed',
    });
  }

  // initialize token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // hash password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

  // パスワード変更メールを送信

  req.flash('success', 'Reset your password successfully! Login with your new password');
  res.redirect('/login');
};