const express = require('express');

const schoolController = require('../controllers/schools');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', schoolController.getSchools);

router.get('/new', authMiddleware.isLoggedIn, schoolController.newSchool);

router.post('/', authMiddleware.isLoggedIn, schoolController.createSchool);

router.get('/:schoolId', schoolController.getSchool);

router.get('/:schoolId/edit', authMiddleware.isLoggedIn, authMiddleware.isSchoolAuthorized, schoolController.editSchool);

router.put('/:schoolId', authMiddleware.isLoggedIn, authMiddleware.isSchoolAuthorized, schoolController.updateSchool);

router.delete('/:schoolId', authMiddleware.isLoggedIn, authMiddleware.isSchoolAuthorized, schoolController.deleteSchool);

module.exports = router;