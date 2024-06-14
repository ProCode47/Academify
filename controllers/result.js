const Result = require('../models/index');
const authController = require('./auth');

// Controller function to upload results
async function uploadResults(req, res) {
  try {
      // Extract the academic year, semester, course, and results from the request body
      const { academicYear, semester, course, results } = req.body;

      // Check if the necessary parameters are provided
      if (!academicYear || !semester || !course || !results) {
          return res.status(400).json({ message: 'Missing required parameters' });
      }

      // Process each result to include academic year, semester, and course
      const processedResults = results.map(result => ({
          ...result,
          academicYear,
          semester,
          course
      }));

      // Save the processed results to the database
      await Result.insertMany(processedResults);

      // Generate token for the user (course advisor)
      const token = authController.generateToken(req.user);

      return res.status(201).json({ message: 'Results uploaded successfully', token });
  } catch (error) {
      console.error('Error uploading results:', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
}

// Controller function to view previously uploaded results
async function viewResults(req, res) {
  try {
      // Extract query parameters
      const { academicYear, semester, course } = req.query;

      // Check if the necessary parameters are provided
      if (!academicYear || !semester || !course) {
          return res.status(400).json({ message: 'Missing required query parameters' });
      }

      // Find results based on query parameters
      const results = await Result.find({ academicYear, semester, course });

      return res.status(200).json(results);
  } catch (error) {
      console.error('Error retrieving results:', error);
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
  getStudentResult,
  viewResults
};
