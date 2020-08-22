const bcrypt = require('bcryptjs');
const passport = require('passport');
const nodemailer = require("nodemailer");
const { validationResult } = require('express-validator');

const User = require('../models/User');
const CustomError = require('../utils/CustomError');

exports.signupPage = (req, res, next) => {
  res.render('auth/auth', {
    title: 'Signup',
    formContent: 'signup'
  });
};

exports.signup = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  const renderObject = {
    title: 'Signup',
    formContent: 'signup',
    name,
    email,
    password
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/auth', {
      ...renderObject,
      error: errors.array()[0].msg,
    });
  }

  try {
    const existingUserName = await User.findOne({ name });
    const existingUserEmail = await User.findOne({ email });

    if (existingUserName) {
      return res.status(401).render('auth/auth', {
        ...renderObject,
        error: 'This username has already been registered',
      });
    }

    if (existingUserEmail) {
      return res.status(401).render('auth/auth', {
        ...renderObject,
        error: 'This email has already been registered',
      });
    }

    if (password !== confirmPassword) {
      return res.status(401).render('auth/auth', {
        ...renderObject,
        error: 'Confirm password failed',
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
  res.render('auth/auth', {
    title: 'Login',
    formContent: 'login'
  });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/auth', {
      error: errors.array()[0].msg,
      title: 'Login',
      formContent: 'login',
      email,
      password
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
  res.render('auth/auth', {
    title: 'Forget Password',
    formContent: 'forgotPassword'
  });
};

exports.postForgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash('error', 'No account with that email address exists.');
      return res.redirect('/forgot');
    }

    // produce token and save it
    const token = bcrypt.hashSync('bacon', 8);
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      // send email to user
      async function main() {
        let transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
          }
        });

        const message =
          'You are receiving this email because you (or someone else) has requested the reset of a password.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          `${req.protocol}://${req.get('host')}/reset/${token}\n\n` +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n';
        const subject = 'Password Reset';

        await transporter.sendMail({
          from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
          to: user.email,
          subject,
          text: message
        });
      }
      main();

      req.flash('success', 'Message sent to your email address. Check the email and reset password');
      res.redirect('/login');
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      req.flash('error', 'Something went wrong. Please try again');
      res.redirect('/forgot');
    }
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

    res.render('auth/auth', {
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
    return res.status(422).render('auth/auth', {
      error: errors.array()[0].msg,
      title: 'Change Password',
      formContent: 'resetPassword',
      token: req.params.passwordToken
    });
  }

  // compare password and confirm password
  const { newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(401).render('auth/auth', {
      error: 'Confirm password failed',
      title: 'Change Password',
      formContent: 'resetPassword',
      token: req.params.passwordToken,
    });
  }

  // initialize token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // hash password and save it
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

  // パスワード変更メールを送信

  req.flash('success', 'Reset your password successfully! Login with your new password');
  res.redirect('/login');
};