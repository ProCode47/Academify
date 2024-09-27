const {
  User,
  Student,
  Parent,
  Course,
  Result,
  Semester,
  Comment,
  Notification,
} = require("../models");
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt");

//Get Parent's Profile Details
const getProfile = async (req, res) => {
  try {
    const parentID = req.user._id;

    //Find parent by id
    const parent = await Parent.findOne({ user: parentID }).populate([
      {
        path: "user",
      },
      {
        path: "children",
        populate: {
          path: "user",
          model: "User",
        },
      },
    ]);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Extract user details
    const profile = {
      firstName: parent.user.firstName,
      lastName: parent.user.lastName,
      email: parent.user.email,
      userId: parent.user._id,
      roleId: parent._id,
      // Add more fields as needed
    };

    const children = parent.children;

    if (children) {
      res.status(200).json({ profile, children });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editProfile = async (req, res) => {
  try {
    const parentID = req.user._id;
    const filter = { _id: parentID };

    const { firstName, lastName, password } = req.body;

    // Hash password
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    //Find parent by id
    const parent = await User.findOne(filter);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    if (!password) {
      parent.firstName = firstName;
      parent.lastName = lastName;

      await parent.save();

      // Generate token for the updated user
      const updatedUser = await User.findById(parentID);
      const token = authController.generateToken(updatedUser);

      return res.json({ message: "Profile updated successfully", token });
    }

    parent.firstName = firstName;
    parent.lastName = lastName;
    parent.password = hashedPassword;

    await parent.save();

    // Generate token for the updated user
    const updatedUser = await User.findById(parentID);
    const token = authController.generateToken(updatedUser);

    return res.json({ message: "Password updated successfully", token });
  } catch (error) {
    console.error("Error fetching parent profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Get Results
const getChildResult = async (req, res) => {
  try {
    const { regNo } = req.body;

    const results = await Result.find({ regno: regNo })
      .populate("course")
      .populate("semester");

    if (!results) {
      return res
        .status(404)
        .json({ message: "No results found for the student" });
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLatestChildResult = async (req, res) => {
  try {
    const { regNo } = req.body;

    const studentResults = await Result.find({ regno: regNo })
      .populate("course")
      .populate("semester")
      .sort({ "semester.session": -1, "semester.name": -1 }) // Sort by session and semester name
      .exec();

    console.log(studentResults);

    if (studentResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for the student" });
    }

    // Get the latest two semesters
    const latestSemesters = Array.from(
      new Set(studentResults.map((result) => result.semester._id.toString()))
    ).slice(0, 2);

    // Initialize results object with null values
    const resultsBySemester = {
      firstSemester: null,
      secondSemester: null,
    };

    // Populate the results object based on available semesters
    if (latestSemesters.length > 0) {
      resultsBySemester.firstSemester = studentResults.filter(
        (result) => result.semester._id.toString() === latestSemesters[0]
      );
    }

    if (latestSemesters.length > 1) {
      resultsBySemester.secondSemester = studentResults.filter(
        (result) => result.semester._id.toString() === latestSemesters[1]
      );
    }

    res.status(200).json(resultsBySemester);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//add child to parent
const addChild = async (req, res) => {
  try {
    const parentID = req.user._id;

    //Find parent by id
    const parent = await Parent.findOne({ user: parentID });

    let children = parent.children;

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const { regNo } = req.body;
    const filter = { reg: regNo };

    const student = await Student.findOne(filter);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentFound = children.includes(student._id);

    if (studentFound) {
      return res.status(404).json({ message: "Child already added" });
    }

    Parent.findOneAndUpdate(
      { user: parentID },
      { $push: { children: student._id } },
      { new: true }
    )
      .then(() => {
        res.status(200).json({ message: "Child Added Successfully" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProfile,
  editProfile,
  addChild,
  getChildResult,
  getLatestChildResult,
};
