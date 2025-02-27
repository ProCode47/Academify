const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Student, Parent, CourseAdvisor, CourseCoordinator } = require("../models");
const config = require("../config/config");

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ userId: user._id, email: user.email, role: user.role }, config.secretKey, {
    expiresIn: "24h",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.secretKey);
};

const registerUser = async (req, res, userType) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: userType,
    });
    await newUser.save();

    // Create role specific record
    let roleSpecificData;
    switch (userType) {
      case "student":
        const { reg, advisor } = req.body;
        const classAdvisor = await CourseAdvisor.findOne({ _id: advisor });
        roleSpecificData = new Student({
          user: newUser._id,
          reg,
          courseAdvisor: classAdvisor._id,
        });
        await roleSpecificData.save();

        // Add the student to the course advisor's list of students
        classAdvisor.students.push(roleSpecificData._id);
        await classAdvisor.save();
        break;
      case "parent":
        roleSpecificData = new Parent({ user: newUser._id });
        await roleSpecificData.save();
        break;
      case "course_advisor":
        roleSpecificData = new CourseAdvisor({ user: newUser._id });
        await roleSpecificData.save();
        break;
      case "course_coordinator":
        roleSpecificData = new CourseCoordinator({ user: newUser._id });
        await roleSpecificData.save();
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    const token = generateToken(newUser);
    res.status(201).json({ token, userID: newUser._id, userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res, userType) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify if the user's role matches the requested userType
    if (user.role !== userType) {
      return res.status(401).json({ message: `Invalid role. You are registered as a ${user.role === "course_advisor" ? "course advisor" : user.role}` });
    }

    let userID;

    // Get the respective ID based on user type
    switch (userType) {
      case "student":
        const student = await Student.findOne({ user: user._id });
        if (!student) {
          return res.status(404).json({ message: "Student data not found" });
        }
        userID = student._id;
        break;
      case "parent":
        const parent = await Parent.findOne({ user: user._id });
        if (!parent) {
          return res.status(404).json({ message: "Parent data not found" });
        }
        userID = parent._id;
        break;
      case "course_advisor":
        const courseAdvisor = await CourseAdvisor.findOne({ user: user._id });
        if (!courseAdvisor) {
          return res.status(404).json({ message: "Course advisor data not found" });
        }
        userID = courseAdvisor._id;
        break;
      case "course_coordinator":
        const courseCoordinator = await CourseCoordinator.findOne({ user: user._id });
        if (!courseCoordinator) {
          return res.status(404).json({ message: "Course coordinator data not found" });
        }
        userID = courseCoordinator._id;
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    // Generate token
    const token = generateToken(user);
    res.status(200).json({ token, userID, userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerStudent: async (req, res) => registerUser(req, res, "student"),
  registerParent: async (req, res) => registerUser(req, res, "parent"),
  registerCourseAdvisor: async (req, res) => registerUser(req, res, "course_advisor"),
  registerCourseCoordinator: async (req, res) => registerUser(req, res, "course_coordinator"),
  loginStudent: async (req, res) => loginUser(req, res, "student"),
  loginParent: async (req, res) => loginUser(req, res, "parent"),
  loginCourseAdvisor: async (req, res) => loginUser(req, res, "course_advisor"),
  loginCourseCoordinator: async (req, res) => loginUser(req, res, "course_coordinator"), 
  generateToken,
  verifyToken,
};
