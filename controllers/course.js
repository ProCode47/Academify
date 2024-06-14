const { Student, Course } = require("../models");
const coursesData = require("../data/courses.json");

const loadCourses = async (req, res) => {
  try {
    // Loop through each level of courses
    for (const level in coursesData) {
      const courses = coursesData[level];
      // Loop through each course in the level
      for (const course of courses) {
        // Check if the course already exists in the database
        const existingCourse = await Course.findOne({ code: course.code });
        // If the course doesn't exist, create a new course
        if (!existingCourse) {
          console.log(course);
          await Course.create(course);
        }
      }
    }
    res.status(200).json({ message: "Courses loaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const registerCourses = async (req, res) => {
  try {
    const { reg, courseCodes } = req.body;

    // Find student by registration number
    const student = await Student.findOne({ reg });
    console.log(student.courses)
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find courses by course codes
    const coursesToAdd = await Course.find({ code: { $in: courseCodes } });
    if (coursesToAdd.length !== courseCodes.length) {
      return res.status(400).json({ message: "Some courses not found" });
    }

    // Filter out courses that the student has already registered
    const newCourses = coursesToAdd.filter(
      (course) => !student.courses.includes(course._id)
    );

    // Check if all requested courses are duplicates
    if (newCourses.length === 0) {
      return res
        .status(400)
        .json({ message: "All requested courses are already registered" });
    }

    // Add only new courses to student's course list
    student.courses = [...student.courses, ...newCourses.map(course => course._id)];

    // Save the updated student document
    await student.save();

    // Log the updated student document for debugging
    console.log('Updated student courses:', student.courses);

    res.status(200).json({ message: "Courses registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getCoursesByLevelAndSemester = (req, res) => {
  try {
    const { level, semester } = req.params;

    // Get the courses for the specified level
    const levelCourses = coursesData[`${level}_LEVEL_COURSES`];

    // Determine semester type (harmattan or rain)
    const isOddSemester = semester.toLowerCase() === "harmattan";

    // Filter courses based on semester
    const semesterCourses = levelCourses.filter((course) => {
      const isOddCourseCode = parseInt(course.code.split(" ")[1]) % 2 !== 0;
      return isOddSemester ? isOddCourseCode : !isOddCourseCode;
    });

    res.status(200).json({ courses: semesterCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerCourses,
  getCoursesByLevelAndSemester,
  loadCourses,
};
