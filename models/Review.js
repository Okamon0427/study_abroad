const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    enum: [
      'Certificate (1 year)',
      'Diploma (2 years)',
      'Advanced Diploma (3 years)',
      'Bachelor (4 years)',
      'Master',
      'Doctor',
      'Other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  school: {
    type: mongoose.Schema.ObjectId,
    ref: 'School',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);