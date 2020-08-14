const express = require('express');

const schoolController = require('../controllers/schools');

const router = express.Router();

router.get('/new', schoolController.newSchool);

router.post('/', schoolController.createSchool);

module.exports = router;