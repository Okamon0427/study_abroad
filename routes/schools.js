const express = require('express');
const { check } = require('express-validator');

const {
  getSchools,
  newSchool,
  createSchool,
  getSchool,
  editSchool,
  updateSchool,
  deleteSchool
} = require('../controllers/schools');
const { isLoggedIn, isSchoolAuthorized } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSchools);

router.get('/new', isLoggedIn, newSchool);

router.post(
  '/',
  isLoggedIn,
  [
    check('name')
      .not()
      .isEmpty()
      .withMessage('Name should not be empty'),
    check('country')
      .not()
      .isEmpty()
      .withMessage('Country should not be empty'),
    check('tuition')
      .not()
      .isEmpty()
      .withMessage('Tuition should not be empty'),
    check('description')
      .isLength({ max: 500 })
      .withMessage('Description must be within 500 chars long')
  ],
  createSchool
);

router.get('/:schoolId', getSchool);

router.get('/:schoolId/edit', isLoggedIn, isSchoolAuthorized, editSchool);

router.put(
  '/:schoolId',
  isLoggedIn,
  isSchoolAuthorized,
  [
    check('name')
      .not()
      .isEmpty()
      .withMessage('Name should not be empty'),
    check('country')
      .not()
      .isEmpty()
      .withMessage('Country should not be empty'),
    check('tuition')
      .not()
      .isEmpty()
      .withMessage('Tuition should not be empty'),
    check('description')
      .isLength({ max: 500 })
      .withMessage('Description must be within 500 chars long')
  ],
  updateSchool
);

router.delete('/:schoolId', isLoggedIn, isSchoolAuthorized, deleteSchool);

module.exports = router;