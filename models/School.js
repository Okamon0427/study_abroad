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
  averageRating: {
    type: Number,
    min: 1,
    max: 5
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// delete Review when corresponding school is deleted
SchoolSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ school: this._id });
  next();
});

SchoolSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'school',
  justOne: false
});

module.exports = mongoose.model('School', SchoolSchema);