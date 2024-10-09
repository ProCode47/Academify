const { CourseCoordinator, User, Course } = require('../models');
const authController = require('../controllers/auth');
const bcrypt = require('bcrypt');

// Controller function to get the profile information of the course coordinator
async function getCoordinatorProfile(req, res) {
try {
  const userId = req.user._id;
 
  // Find the course coordinator record associated with the user ID
  const courseCoordinator = await CourseCoordinator.findOne({ user: userId }).populate('user');
 
  if (!courseCoordinator) {
   return res.status(404).json({ message: "Course Coordinator not found" });
  }
 
  // Return the profile information of the course coordinator
  const profile = {
   userID: courseCoordinator.user._id,
   roleID: courseCoordinator._id,
   name: `${courseCoordinator.user.firstName} ${courseCoordinator.user.lastName}`,
   email: courseCoordinator.user.email,
   courses: courseCoordinator.courses, // List of courses
   // Add more fields as needed
  };
 
  // Generate token for the user
  const token = authController.generateToken(courseCoordinator.user);
 
  return res.json({ profile, token });
 } catch (error) {
  console.error("Error fetching course coordinator profile:", error);
  return res.status(500).json({ message: "Internal server error" });
 }
}

// Controller function to update the course coordinator's password
async function updateCoordinatorPassword(req, res) {
try {
 const userId = req.user._id; // Retrieve the authenticated user's ID

 // Extract the new password from the request body
 const { newPassword } = req.body;

 // Find the user record associated with the user ID
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

// Controller function to update the course coordinator's profile
async function updateCoordinatorProfile(req, res) {
try {
 const { firstName, lastName, email, courses } = req.body;
 const userId = req.user._id;

 // Validate the request body
 if (!userId || !firstName || !lastName || !email || !courses) {
  return res.status(400).json({ message: "Missing required fields" });
 }

 // Update User details
 const updatedUser = await User.findByIdAndUpdate(userId, {
  firstName,
  lastName,
  email,
 }, { new: true });

 if (!updatedUser) {
  return res.status(404).json({ message: "User not found" });
 }

 // Update CourseCoordinator details
 const courseCoordinator = await CourseCoordinator.findOne({ user: userId });

 if (!courseCoordinator) {
  return res.status(404).json({ message: "Course Coordinator not found" });
 }

 // Update the list of courses for the course coordinator
 courseCoordinator.courses = courses;

 await courseCoordinator.save();

 return res.status(200).json({ message: "Course Coordinator details updated successfully", user: updatedUser, courseCoordinator });
} catch (error) {
 console.error("Error updating Course Coordinator details:", error);
 return res.status(500).json({ message: "Internal server error" });
}
}

// Controller function to get all course coordinators
async function getAllCourseCoordinators(req, res) {
try {
 const courseCoordinators = await CourseCoordinator.find().populate('user').populate('courses');
 res.status(200).json(courseCoordinators);
} catch (error) {
 console.error('Error in getAllCourseCoordinators:', error);
 res.status(500).json({ message: 'Internal server error' });
}
}

// Function to get all courses under the authenticated course coordinator
async function getAllCoursesUnderCourseCoordinator(req, res) {
try {
 const userId = req.user.id;

 // Find the course coordinator record associated with the user ID
 const courseCoordinator = await CourseCoordinator.findOne({ user: userId });

 if (!courseCoordinator) {
  return res.status(404).json({ message: 'Course coordinator not found' });
 }

 // Find all courses that the course coordinator is coordinating
 const courses = await Course.find({ _id: { $in: courseCoordinator.courses } });

 res.status(200).json(courses);
} catch (error) {
 console.error('Error fetching courses under course coordinator:', error);
 res.status(500).json({ message: 'Internal server error' });
}
}

module.exports = {
 getCoordinatorProfile,
 updateCoordinatorPassword,
 updateCoordinatorProfile,
 getAllCourseCoordinators,
 getAllCoursesUnderCourseCoordinator,
};
