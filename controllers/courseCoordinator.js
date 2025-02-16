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
      courses: courseCodes,
    };

    return res.json({ profile });
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

    // Update User details
    const updateUser = {};
    if (firstName !== undefined) updateUser.firstName = firstName;
    if (lastName !== undefined) updateUser.lastName = lastName;
    if (email !== undefined) {
      // Check email uniqueness
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateUser.email = email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateUser,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update courses if provided
    if (courseCodes) {
      const courseCoordinator = await CourseCoordinator.findOne({ user: userId });
      if (!courseCoordinator) {
        return res.status(404).json({ message: "Course Coordinator not found" });
      }

      // Convert course codes to IDs
      const courseIds = await getCourseIdsFromCodes(courseCodes);
      courseCoordinator.courses = courseIds;
      await courseCoordinator.save();
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email
      },
      ...(courseCodes && { courses: courseCodes })
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.message === "Some course codes are invalid") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all course coordinators with course codes
async function getAllCourseCoordinators(req, res) {
  try {
    const coordinators = await CourseCoordinator.find()
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'courses',
        select: 'code',
      });

    const response = coordinators.map(coordinator => ({
      _id: coordinator._id,
      user: {
        firstName: coordinator.user.firstName,
        lastName: coordinator.user.lastName,
        email: coordinator.user.email
      },
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
    const userId = req.user._id;

    const coordinator = await CourseCoordinator.findOne({ user: userId })
      .populate({
        path: 'courses',
        select: 'code name credits type',
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
    const { courseCodes } = req.body;
    const userId = req.user._id;

    if (!courseCodes || !Array.isArray(courseCodes)) {
      return res.status(400).json({ message: "Invalid course codes" });
    }

    const coordinator = await CourseCoordinator.findOne({ user: userId })
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
    if (error.message === "Some course codes are invalid") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function to update the course coordinator's password
async function updateCoordinatorPassword(req, res) {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Generate new token
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
    const { courseCodes } = req.body;
    const userId = req.user._id;

    if (!courseCodes || !Array.isArray(courseCodes)) {
      return res.status(400).json({ message: "Invalid course codes" });
    }

    const coordinator = await CourseCoordinator.findOne({ user: userId });
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    // Convert codes to IDs
    const courseIdsToRemove = await getCourseIdsFromCodes(courseCodes);
    const courseIdsToRemoveStrings = courseIdsToRemove.map(id => id.toString());

    // Filter out the IDs to remove
    coordinator.courses = coordinator.courses.filter(
      courseId => !courseIdsToRemoveStrings.includes(courseId.toString())
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
    if (error.message === "Some course codes are invalid") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit courses for a coordinator using codes
const editCoursesForCoordinator = async (req, res) => {
  try {
    const { newCourseCodes } = req.body;
    const userId = req.user._id;

    if (!newCourseCodes || !Array.isArray(newCourseCodes)) {
      return res.status(400).json({ message: "Invalid course codes" });
    }

    const coordinator = await CourseCoordinator.findOne({ user: userId });
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
    if (error.message === "Some course codes are invalid") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
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