const bcrypt = require('bcryptjs');

const User = require("../models/User");
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

    if (typeof req.body.newEmail != 'undefined') {
      const existingUser = await User.findOne({ email: req.body.newEmail });

      if (existingUser) {
        return res.status(401).render('users/edit', {
          title: 'My Page',
          error: 'This email has already been registered',
          editContent: 'email',
          user
        });
      }

      updatedObject = { $set: { email: req.body.newEmail } };
    }

    if (typeof req.body.newPassword != 'undefined') {
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
      updatedObject = { $set: { password: hashedPassword } };
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