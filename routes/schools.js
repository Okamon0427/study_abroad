const express = require('express');

const schoolController = require('../controllers/schools');

const router = express.Router();

router.get('/', schoolController.getSchools);

router.get('/new', schoolController.newSchool);

router.post('/', schoolController.createSchool);

router.get('/:schoolId', schoolController.getSchool);

router.get('/:schoolId/edit', schoolController.editSchool);

router.put('/:schoolId', schoolController.updateSchool);

module.exports = router;