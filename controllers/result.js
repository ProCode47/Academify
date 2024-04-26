const Result = require('../models/index');
const authController = require('./auth');

// Controller function to upload results
async function uploadResults(req, res) {
  try {
    // Assuming the uploaded results are received as JSON in the request body
    const { results } = req.body;

    // Save the results to the database
    await Result.insertMany(results);

    // Generate token for the user (course advisor)
    const token = authController.generateToken(req.user);

    return res.status(201).json({ message: 'Results uploaded successfully', token });
  } catch (error) {
    console.error('Error uploading results:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// Fetch student result controller
async function getStudentResult (req, res) {
  try {
    const { studentId } = req.params;

    // Find results for the student
    const results = await Result.find({ student: studentId }).populate('course');

    if (!results) {
      return res.status(404).json({ message: "No results found for the student" });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  uploadResults,
  getStudentResult
};
