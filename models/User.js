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
  image: {
    type: String,
    default: 'uploads\\no-photo.jpg'
  },
  english: {
    type: String,
    maxlength: 100
  },
  studentType: {
    type: String,
    enum: [
      'highSchool',
      'college',
      'university',
      'graduate',
      'worker',
      'other'
    ]
  }
});

module.exports = mongoose.model('User', UserSchema);