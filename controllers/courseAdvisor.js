const { CourseAdvisor, User, Student } = require('../models');
const authController = require('../controllers/auth');
const bcrypt = require('bcrypt');

// Controller function to get the profile information of the course adviser
async function getProfile(req, res) {
  try {
    const userId = req.user._id;
    console.log("damn")
    console.log(req.user)


    // Find the course advisor record associated with the user ID
    const courseAdvisor = await CourseAdvisor.findOne({ user: userId }).populate('user');

    if (!courseAdvisor) {
      return res.status(404).json({ message: "Course adviser not found" });
    }

    // Return the profile information of the course advisor
    const profile = {
      name: `${courseAdvisor.user.firstName} ${courseAdvisor.user.lastName}`,
      email: courseAdvisor.user.email,
      photo: courseAdvisor.photo,
      level: courseAdvisor.level,
      // Add more fields as needed
    };

    // Generate token for the user
    const token = authController.generateToken(courseAdvisor.user);

    return res.json({ profile, token });
  } catch (error) {
    console.error("Error fetching course adviser profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Controller function to update the course advisor's password
async function updatePassword(req, res) {
  try {
    const userId = req.user.id; // Retrieve the authenticated user's ID

    // Extract the new password from the request body
    const { newPassword } = req.body;

    // Find the course advisor record associated with the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password field of the user record
    user.password = hashedPassword;
    await user.save();

    // Generate token for the updated user
    const token = authController.generateToken(user);

    return res.json({ message: "Password updated successfully", token });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Controller function to update the course advisor's profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, level } = req.body;

    // Find the course advisor by user ID
    let courseAdvisor = await CourseAdvisor.findOne({ user: userId });

    if (!courseAdvisor) {
      return res.status(404).json({ message: "Course advisor not found" });
    }

    // Update the course advisor's profile fields
    if (firstName) courseAdvisor.user.firstName = firstName;
    if (lastName) courseAdvisor.user.lastName = lastName;
    if (email) courseAdvisor.user.email = email;

    // Save the updated user profile
    await courseAdvisor.user.save();

    // Update the course advisor's specific fields
    if (level) courseAdvisor.level = level;

    // Save the updated course advisor profile
    await courseAdvisor.save();

    return res.status(200).json({ 
      message: "Profile updated successfully", 
      courseAdvisor 
    });
  } catch (error) {
    console.error("Error updating course advisor profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllCourseAdvisors(req, res) {
  try {
    const courseAdvisors = await CourseAdvisor.find().populate('user');
    res.status(200).json(courseAdvisors);
  } catch (error) {
    console.error('Error in getAllCourseAdvisors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to get all students under the authenticated course advisor
async function getAllStudentsUnderCourseAdvisor(req, res) {
  try {
    const userId = req.user.id;

    // Find the course advisor record associated with the user ID
    const courseAdvisor = await CourseAdvisor.findOne({ user: userId });

    if (!courseAdvisor) {
      return res.status(404).json({ message: 'Course advisor not found' });
    }

    // Find all students under the course advisor
    const students = await Student.find({ courseAdvisor: courseAdvisor._id }).populate('user');

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students under course advisor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getProfile,
  updatePassword,
  getAllCourseAdvisors,
  getAllStudentsUnderCourseAdvisor,
  updateProfile
};
