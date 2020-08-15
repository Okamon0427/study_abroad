const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
require('dotenv').config();

const schoolRoutes = require('./routes/schools');
const CustomError = require('./utils/CustomError');

const mongooseConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
};
mongoose.connect(process.env.MONGODB_URI, mongooseConfig)
  .then(() => console.log('Mongoose connected!'))
  .catch(err => console.log(err));

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/schools', schoolRoutes);

app.use((req, res, next) => {
  const error = new CustomError('Could not find this route.', 404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500);
  res.json({ message: error.message || 'Something went wrong' });
});

app.listen(3000, () => {
  console.log('Server has started');
});