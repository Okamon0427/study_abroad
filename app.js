const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const schoolRoutes = require('./routes/schools');

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
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/schools', schoolRoutes);

app.listen(3000, () => {
  console.log('Server has started');
});