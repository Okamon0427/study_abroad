const mongoose = require('mongoose');
const { find } = require('./School');

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
  rating: {
    type: Number,
    min: 1,
    max: 5,
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

// calculate average rating and save it in School Model 
ReviewSchema.statics.getAverageRating = async function(schoolId) {
  try {
    console.log(2)
    const reviews = await this.find({ school: schoolId });
  
    console.log(3)
    console.log(reviews)

    let reviewsSum = 0;
    reviews.forEach(review => {
      reviewsSum += review.rating
    });

    console.log(4)
    console.log(reviewsSum)

    const averageRating = reviewsSum / reviews.length;
    console.log(averageRating)

    await this.model('School').findByIdAndUpdate(
      schoolId,
      { averageRating }
    );
  } catch (err) {
    next(err);
  }
};

// calculate average rating after save review
ReviewSchema.post('save', async function() {
  console.log(1)
  await this.constructor.getAverageRating(this.school);
  console.log('finish!')
});

module.exports = mongoose.model('Review', ReviewSchema);