const {Semester, Course } = require('../models/index');

async function createSemester(req, res) {
  try {
    const { name, session, courses } = req.body;

    // Validate the request body
    if (!name || !session || !courses || !Array.isArray(courses)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Validate semester name
    if (!["Harmattan", "Rain"].includes(name)) {
      return res.status(400).json({ message: "Invalid semester name" });
    }

    // Check if the courses exist and get their _id
    const courseDocs = await Course.find({ code: { $in: courses } });
    if (courseDocs.length !== courses.length) {
      return res.status(404).json({ message: "One or more courses not found" });
    }

    // Extract the _id fields
    const courseIds = courseDocs.map(course => course._id);

    // Check if the semester already exists
    let semester = await Semester.findOne({ name, session });

    if (semester) {
      // Filter out courses that are already registered in the semester
      const newCourses = courseIds.filter(
        courseId => !semester.courses.includes(courseId)
      );

      // Check if all requested courses are duplicates
      if (newCourses.length === 0) {
        return res.status(400).json({ message: "All requested courses are already registered" });
      }

      // Add only new courses to the semester
      semester.courses = [...semester.courses, ...newCourses];

      // Save the updated semester document
      await semester.save();

      return res.status(200).json({ message: "New courses added successfully", semester });
    } else {
      // Create a new semester document
      semester = new Semester({
        name,
        session,
        courses: courseIds
      });

      // Save the semester document
      await semester.save();

      return res.status(201).json(semester);
    }
  } catch (error) {
    console.error("Error creating/updating semester:", error);
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
