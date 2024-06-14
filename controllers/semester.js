const {Semester, Course } = require('../models/index');

// Controller function to create a new semester
async function createSemester(req, res) {
 try {
   const { name, session, courses } = req.body;

   // Validate the request body
   if (!name || !session || !courses || !Array.isArray(courses)) {
     return res.status(400).json({ message: "Invalid request body" });
   }

   // Check if the courses exist
   const courseDocs = await Course.find({ _id: { $in: courses } });
   if (courseDocs.length !== courses.length) {
     return res.status(404).json({ message: "One or more courses not found" });
   }

   // Create a new semester document
   const semester = new Semester({
     name,
     session,
     courses: courses // Store the ObjectId references of the courses
   });

   // Save the semester document
   await semester.save();

   // Populate the courses for the response
   await semester.populate('courses').execPopulate();

   return res.status(201).json(semester);
 } catch (error) {
   console.error("Error creating semester:", error);
   return res.status(500).json({ message: "Internal server error" });
 }
}

// Controller function to get a semester by session and name
async function getSemester(req, res) {
 try {
   const { session, name } = req.query;

   // Validate the request query parameters
   if (!session || !name) {
     return res.status(400).json({ message: "Session and name are required" });
   }

   // Find the semester by session and name and populate the courses
   const semester = await Semester.findOne({ session, name }).populate('courses');

   if (!semester) {
     return res.status(404).json({ message: "Semester not found" });
   }

   return res.status(200).json(semester);
 } catch (error) {
   console.error("Error fetching semester:", error);
   return res.status(500).json({ message: "Internal server error" });
 }
}

module.exports = {
 createSemester,
 getSemester
};
