const { Student, Course } = require('../models');

const registerCourses = async (req, res) => {
    try {
        const studentId = req.user.userId; // Assuming userId is stored in the JWT token
        const { courseIds } = req.body;

        // Find student by ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Find courses by IDs
        const courses = await Course.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return res.status(400).json({ message: 'Some courses not found' });
        }

        // Add courses to student's course list
        student.courses.push(...courses);
        await student.save();

        res.status(200).json({ message: 'Courses registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    registerCourses
};
