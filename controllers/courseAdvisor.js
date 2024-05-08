const CourseAdvisor = require('../models/index');
const authController = require('../controllers/auth');

// Controller function to get the profile information of the course adviser
async function getProfile(req, res) {
  try {
    console.log(user)
    const userId = req.user.id;

    // Find the course advisor record associated with the user ID
    const courseAdvisor = await CourseAdvisor.findOne({ user: userId });

    if (!courseAdvisor) {
      return res.status(404).json({ message: "Course adviser not found" });
    }

    // Return the profile information of the course advisor
    const profile = {
     name: `${req.user.firstName} ${req.user.lastName}`,
     email: req.user.email,
     photo: courseAdvisor.photo,
     level: courseAdvisor.level,
     // Add more fields as needed
   };

   // Generate token for the user
   const token = authController.generateToken(req.user);

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
    let courseAdvisor = await CourseAdvisor.findOne({ user: userId });

    if (!courseAdvisor) {
      return res.status(404).json({ message: "Course adviser not found" });
    }

    // Update the password field of the course advisor record
    courseAdvisor.password = newPassword;
    await courseAdvisor.save();

    // Generate token for the updated user
    const updatedUser = await User.findById(userId);
    const token = authController.generateToken(updatedUser);

    return res.json({ message: "Password updated successfully", token });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllCourseAdvisors (req, res) {
  try {
    // Fetch all course advisors
    const courseAdvisors = await CourseAdvisor.find();
    res.status(200).json(courseAdvisors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getProfile,
  updatePassword,
  getAllCourseAdvisors
};
