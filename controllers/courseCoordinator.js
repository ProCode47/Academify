const { CourseCoordinator, User, Course } = require('../models');
const authController = require('../controllers/auth');
const bcrypt = require('bcrypt');

// Helper function to convert course codes to course IDs
const getCourseIdsFromCodes = async (courseCodes) => {
  const courses = await Course.find({ code: { $in: courseCodes } });
  if (courses.length !== courseCodes.length) {
    throw new Error("Some course codes are invalid");
  }
  return courses.map(course => course._id);
};

// Controller function to get the profile information of the course coordinator
async function getCoordinatorProfile(req, res) {
  try {
    const userId = req.user._id;

    // Find the course coordinator and populate courses with codes
    const courseCoordinator = await CourseCoordinator.findOne({ user: userId })
      .populate({
        path: 'courses',
        select: 'code', // Only return course codes
      })
      .populate('user');

    if (!courseCoordinator) {
      return res.status(404).json({ message: "Course Coordinator not found" });
    }

    // Extract course codes from populated courses
    const courseCodes = courseCoordinator.courses.map(course => course.code);

    const profile = {
      userID: courseCoordinator.user._id,
      roleID: courseCoordinator._id,
      name: `${courseCoordinator.user.firstName} ${courseCoordinator.user.lastName}`,
      email: courseCoordinator.user.email,
      courses: courseCodes, // Now returns course codes
    };

    const token = authController.generateToken(courseCoordinator.user);
    return res.json({ profile, token });
  } catch (error) {
    console.error("Error fetching course coordinator profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Controller function to update the course coordinator's profile
async function updateCoordinatorProfile(req, res) {
  try {
    const { firstName, lastName, email, courses: courseCodes } = req.body;
    const userId = req.user._id;

    if (!userId || !firstName || !lastName || !email || !courseCodes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Update User details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update CourseCoordinator details
    const courseCoordinator = await CourseCoordinator.findOne({ user: userId });
    if (!courseCoordinator) {
      return res.status(404).json({ message: "Course Coordinator not found" });
    }

    // Convert course codes to IDs
    const courseIds = await getCourseIdsFromCodes(courseCodes);
    courseCoordinator.courses = courseIds;
    await courseCoordinator.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      courses: courseCodes, // Return codes for confirmation
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}

// Get all course coordinators with course codes
async function getAllCourseCoordinators(req, res) {
  try {
    const coordinators = await CourseCoordinator.find()
      .populate({
        path: 'user',
        select: 'firstName lastName email',
      })
      .populate({
        path: 'courses',
        select: 'code', // Return course codes instead of IDs
      });

    // Transform response to include course codes
    const response = coordinators.map(coordinator => ({
      _id: coordinator._id,
      user: coordinator.user,
      courses: coordinator.courses.map(course => course.code),
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all courses under a coordinator (returns codes)
async function getAllCoursesUnderCourseCoordinator(req, res) {
  try {
    const userId = req.user.id;

    const coordinator = await CourseCoordinator.findOne({ user: userId })
      .populate({
        path: 'courses',
        select: 'code name credits type', // Include relevant course fields
      });

    if (!coordinator) {
      return res.status(404).json({ message: 'Course coordinator not found' });
    }

    res.status(200).json(coordinator.courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Add courses to a coordinator using codes
const addCoursesToCoordinator = async (req, res) => {
  try {
    const { coordinatorId, courseCodes } = req.body;

    if (!courseCodes || !Array.isArray(courseCodes)) {
      return res.status(400).json({ message: "Invalid course codes" });
    }

    const coordinator = await CourseCoordinator.findById(coordinatorId)
      .populate('courses');

    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    // Convert codes to IDs
    const courseIds = await getCourseIdsFromCodes(courseCodes);

    // Check for duplicates
    const existingCourseIds = coordinator.courses.map(course => course._id.toString());
    const duplicates = courseIds.filter(id => existingCourseIds.includes(id.toString()));

    if (duplicates.length > 0) {
      const duplicateCourses = await Course.find({ _id: { $in: duplicates } });
      const duplicateCodes = duplicateCourses.map(course => course.code);
      return res.status(400).json({ message: `Duplicates: ${duplicateCodes.join(', ')}` });
    }

    // Add new courses
    coordinator.courses.push(...courseIds);
    await coordinator.save();

    // Return updated list of course codes
    const updatedCourses = await Course.find({ _id: { $in: coordinator.courses } });
    res.status(200).json({
      message: "Courses added successfully",
      courses: updatedCourses.map(course => course.code),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

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

// Remove courses from a coordinator using codes
const removeCoursesFromCoordinator = async (req, res) => {
  try {
    const { coordinatorId, courseCodes } = req.body;

    if (!courseCodes || !Array.isArray(courseCodes)) {
      return res.status(400).json({ message: "Invalid course codes" });
    }

    const coordinator = await CourseCoordinator.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    // Convert codes to IDs
    const courseIdsToRemove = await getCourseIdsFromCodes(courseCodes);

    // Filter out the IDs to remove
    coordinator.courses = coordinator.courses.filter(
      courseId => !courseIdsToRemove.includes(courseId.toString())
    );

    await coordinator.save();

    // Return remaining course codes
    const remainingCourses = await Course.find({ _id: { $in: coordinator.courses } });
    res.status(200).json({
      message: "Courses removed successfully",
      courses: remainingCourses.map(course => course.code),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Edit courses for a coordinator using codes
const editCoursesForCoordinator = async (req, res) => {
  try {
    const { coordinatorId, newCourseCodes } = req.body;

    if (!newCourseCodes || !Array.isArray(newCourseCodes)) {
      return res.status(400).json({ message: "Invalid course codes" });
    }

    const coordinator = await CourseCoordinator.findById(coordinatorId);
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    // Convert new codes to IDs
    const newCourseIds = await getCourseIdsFromCodes(newCourseCodes);
    coordinator.courses = newCourseIds;
    await coordinator.save();

    // Return updated course codes
    const updatedCourses = await Course.find({ _id: { $in: coordinator.courses } });
    res.status(200).json({
      message: "Courses updated successfully",
      courses: updatedCourses.map(course => course.code),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

module.exports = {
  getCoordinatorProfile,
  updateCoordinatorPassword,
  updateCoordinatorProfile,
  getAllCourseCoordinators,
  getAllCoursesUnderCourseCoordinator,
  addCoursesToCoordinator,
  removeCoursesFromCoordinator,
  editCoursesForCoordinator,
};