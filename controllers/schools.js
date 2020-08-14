const School = require('../models/School');

exports.getSchools = async (req, res, next) => {
  try {
    const schools = await School.find();
    res.status(200).json({ success: true, data: schools });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.newSchool = (req, res, next) => {
  res.status(200).json({ success: true, message: 'create new school page' });
};

exports.createSchool = async (req, res, next) => {
  try {
    const createdSchool = await School.create(req.body);
    res.status(201).json({ success: true, data: createdSchool });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.status(200).json({ success: true, data: school });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.editSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.status(200).json({ success: true, data: school });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

exports.updateSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await School.findByIdAndUpdate(req.params.schoolId, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: updatedSchool });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};