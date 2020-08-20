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
      'High School Student',
      'College Student',
      'University Student',
      'Graduate School Student',
      'Worker',
      'Other'
    ]
  }
});

UserSchema.pre('remove', async function (next) {
  // delete School when corresponding school is deleted
  await this.model('School').deleteMany({ user: this._id });

  // remove user from likes array in School
  await this.model('School').updateMany(
    {},
    {
      $pull: { likes: { $in: [this._id] } }
    }
  );

  // delete Review when corresponding school is deleted
  await this.model('Review').deleteMany({ user: this._id });
  
  next();
});

module.exports = mongoose.model('User', UserSchema);