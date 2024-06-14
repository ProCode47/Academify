const {Semester, Course } = require('../models/index');

async function createSemester(req, res) {
 try {
   const { name, session, courses } = req.body;

   // Validate the request body
   if (!name || !session || !courses || !Array.isArray(courses)) {
     return res.status(400).json({ message: "Invalid request body" });
   }

   // Check if the courses exist and get their _id
   const courseDocs = await Course.find({ code: { $in: courses } }, '_id');
   if (courseDocs.length !== courses.length) {
     return res.status(404).json({ message: "One or more courses not found" });
   }

   // Extract the _id fields
   const courseIds = courseDocs.map(course => course._id);

   // Create a new semester document
   const semester = new Semester({
     name,
     session,
     courses: courseIds
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

// Controller function to get semesters with optional query parameters
async function getSemesters(req, res) {
 try {
   const { session, name } = req.query;

   // Build the query object based on provided query parameters
   let query = {};
   if (session) query.session = session;
   if (name) query.name = name;

   // Find the semesters based on the query object and populate the courses
   const semesters = await Semester.find(query).populate('courses');

   if (semesters.length === 0) {
     return res.status(404).json({ message: "No semesters found" });
   }

   return res.status(200).json(semesters);
 } catch (error) {
   console.error("Error fetching semesters:", error);
   return res.status(500).json({ message: "Internal server error" });
 }
}

module.exports = {
 createSemester,
 getSemesters
};
