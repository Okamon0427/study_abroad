const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    retuired: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  introduction: {
    type: String,
    maxlength: 500
  },
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
});

module.exports = mongoose.model('User', UserSchema);