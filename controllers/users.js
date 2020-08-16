const User = require("../models/User");
const CustomError = require('../utils/CustomError');

exports.userPage = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    let mypage = false;
    let title = `${user.name}'s Page`;

    if (user._id.toString() === req.user._id.toString()) {
      mypage = true;
      title = 'My Page';
    }
    
    res.render('users/userPage', {
      title,
      user,
      mypage
    });
  } catch (err) {
    const error = new CustomError('Something went wrong', 500);
    return next(error);
  }
};