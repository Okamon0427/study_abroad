const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require("../models/User");
const School = require('../models/School');
const CustomError = require('../utils/CustomError');

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    let mypage = false;
    let title = `${user.name}'s Page`;

    if (user._id.toString() === req.user._id.toString()) {
      mypage = true;
      title = 'My Page';
    }
    
    res.render('users/user', {
      title,
      user,
      mypage
    });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.editUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new CustomError('User not found', 404);
      return next(error);
    }

    res.render('users/edit', {
      title: 'My Page',
      editContent: req.query.content,
      user
    });
    
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new CustomError('User not found', 404);
      return next(error);
    }

    let updatedObject;
    const errors = validationResult(req);

    if (req.body.content === 'profile') {
      if (!errors.isEmpty()) {
        const targetError = errors.array()[0].nestedErrors.find(
          content => content.param === 'name' || content.param === 'introduction'
        );
    
        const user = { ...req.body };
    
        return res.status(422).render('users/edit', {
          title: 'My Page',
          error: targetError.msg,
          editContent: 'profile',
          user
        });
      }
      delete req.body.content;
      updatedObject = { ...req.body };
    }

    if (req.body.content === 'email') {
      if (!errors.isEmpty()) {
        const targetError = errors.array()[0].nestedErrors.find(
          content => content.param === 'newEmail'
          );
        const user = { ...req.body }
        return res.status(422).render('users/edit', {
          title: 'My Page',
          error: targetError.msg,
          editContent: 'email',
          user
        });
      }

      const { newEmail } = req.body;
      const existingUser = await User.findOne({ email: newEmail });

      if (existingUser) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'This email has already been registered',
          editContent: 'email',
          user
        });
      }

      updatedObject = { email: newEmail };
    }

    if (req.body.content === 'password') {
      if (!errors.isEmpty()) {
        const targetError = errors.array()[0].nestedErrors.find(
          content => content.param === 'newPassword'
          );
        return res.status(422).render('users/edit', {
          title: 'My Page',
          error: targetError.msg,
          editContent: 'password',
        });
      }

      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'incorrect current password',
          editContent: 'password',
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'Confirm password failed',
          editContent: 'password',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updatedObject = { password: hashedPassword };
    }

    await User.findByIdAndUpdate(req.user.id, updatedObject, {
      new: true,
      runValidators: true
    });

    req.flash('success', 'Editted your account!');
    res.redirect(`/users/${user._id}`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new CustomError('User not found', 404);
      return next(error);
    }

    await User.findByIdAndDelete(req.user.id);

    req.flash('success', 'Deleted your account!');
    res.redirect(`/schools`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
}