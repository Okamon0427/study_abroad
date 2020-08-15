const express = require('express');

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

router.post('/', isLoggedIn, createSchool);

router.get('/:schoolId', getSchool);

router.get('/:schoolId/edit', isLoggedIn, isSchoolAuthorized, editSchool);

router.put('/:schoolId', isLoggedIn, isSchoolAuthorized, updateSchool);

router.delete('/:schoolId', isLoggedIn, isSchoolAuthorized, deleteSchool);

module.exports = router;