const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config();

const schoolRoutes = require('./routes/schools');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const User = require('./models/User');
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

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email }, (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

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
  secret: 'ramen is the most favorite food',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/schools', schoolRoutes);
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
  console.log('Server has started');
});