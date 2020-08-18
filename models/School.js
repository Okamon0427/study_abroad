const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  country: {
    type: String,
    retuired: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: 'uploads\\no-photo.jpg'
  },
  schoolType: {
    type: String,
    enum: [
      'College',
      'University',
      'Language School',
      'Other',
    ]
  },
  website: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('School', SchoolSchema);