const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const multer = require('multer');
const moment = require('moment');
require('dotenv').config();

const schoolRoutes = require('./routes/schools');
const rankingRoutes = require('./routes/ranking');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const authRoutes = require('./routes/auth');
const CustomError = require('./utils/CustomError');
const authenticate = require('./config/passport');
const database = require('./config/database');

// Database Connect
database().catch(err => next(err));

// Passport Connect
authenticate(passport);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(flash());
app.use(multer({ storage: storage }).single('image'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.moment = moment;
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/schools', schoolRoutes);
app.use('/schools', reviewRoutes);
app.use('/ranking', rankingRoutes);
app.use('/users', userRoutes);
app.use(authRoutes);

app.use((req, res, next) => {
  const error = new CustomError('Could not find this route.', 404);
  next(error);
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message || 'Something went wrong';
  res.status(status).render('error', { title: 'Error', message });
});

app.listen(3000, () => {
  console.log('Server has started!');
});