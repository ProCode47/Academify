const { Student, User } = require("../models");

const getStudentByRegNo = async (req, res) => {
  try {
    const userID = req.user._id;

    // Find student by userID
    const reg = await Student.findOne({ user: userID }).select("reg");
    console.log(reg);
    const student = await Student.findOne({ reg: reg.reg })
      .populate("user")
      .populate("courses");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Extract user details from populated data
    console.log({ student });
    console.log(student.courses);
    res.status(200).json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getStudentByRegNo,
};
