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