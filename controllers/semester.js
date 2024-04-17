const { Semester } = require('../models');

exports.createSemester = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    // Check if semester already exists
    let existingSemester = await Semester.findOne({ name });
    if (existingSemester) {
      return res.status(400).json({ message: 'Semester already exists' });
    }

    // Create semester
    const newSemester = new Semester({
      name,
      startDate,
      endDate,
    });
    await newSemester.save();

    res.status(201).json({ message: 'Semester created successfully', semester: newSemester });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};