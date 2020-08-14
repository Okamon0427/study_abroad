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
  tuition: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  }
});

module.exports = mongoose.model('School', SchoolSchema);