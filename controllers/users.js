const bcrypt = require('bcryptjs');
const { validationResult, check } = require('express-validator');

const User = require("../models/User");
const School = require('../models/School');
const CustomError = require('../utils/CustomError');
const { deleteFile } = require('../utils/deleteFile');

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    let mypage = false;
    let title = `${user.name}'s Page`;

    if (user._id.toString() === req.user._id.toString()) {
      mypage = true;
      title = 'My Page';
    }
    
    const schools = await School.find({
      likes: { $in: [req.params.userId] }
    })
    .limit(3);

    res.render('users/user', {
      title,
      user,
      schools,
      mypage,
      modal: 'userDelete',
      modalMessage: 'Do you really want to delete this account?'
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
      formContent: req.query.content,
      user,
      mypage: true,
      modal: 'userDelete',
      modalMessage: 'Do you really want to delete this account?'
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
    
        return res.status(422).render('users/edit', {
          title: 'My Page',
          error: targetError.msg,
          formContent: 'profile',
          user: { ...req.body },
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
        });
      }

      const existingUser = await User.findOne({ name: req.body.name });

      if (existingUser && existingUser._id.toString() !== req.user.id.toString()) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'This username has already been registered',
          formContent: 'profile',
          user: { ...req.body },
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
        });
      }

      if (req.file) {
        if (user.image !== 'uploads\\no-photo.jpg') {
          deleteFile(user.image);
        }
        req.body.image = req.file.path;
      }

      console.log(req.body)

      delete req.body.content;
      updatedObject = { ...req.body };
    }

    if (req.body.content === 'email') {
      if (!errors.isEmpty()) {
        const targetError = errors.array()[0].nestedErrors.find(
          content => content.param === 'newEmail'
          );
        return res.status(422).render('users/edit', {
          title: 'My Page',
          error: targetError.msg,
          formContent: 'email',
          user: { ...req.body },
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
        });
      }

      const existingUser = await User.findOne({ email: req.body.newEmail });

      if (existingUser) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'This email has already been registered',
          formContent: 'email',
          user: { ...req.body },
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
        });
      }

      updatedObject = { email: req.body.newEmail };
    }

    if (req.body.content === 'password') {
      if (!errors.isEmpty()) {
        const targetError = errors.array()[0].nestedErrors.find(
          content => content.param === 'newPassword'
          );
        return res.status(422).render('users/edit', {
          title: 'My Page',
          error: targetError.msg,
          formContent: 'password',
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
        });
      }

      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'incorrect current password',
          formContent: 'password',
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
        });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'Confirm password failed',
          formContent: 'password',
          mypage: true,
          modal: 'userDelete',
          modalMessage: 'Do you really want to delete this account?'
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

    if (user.image !== 'uploads\\no-photo.jpg') {
      deleteFile(user.image);
    }

    await User.findByIdAndDelete(req.user.id);

    req.flash('success', 'Deleted your account!');
    res.redirect(`/schools`);
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
}