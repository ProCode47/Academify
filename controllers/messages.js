const { Student, Parent, CourseAdvisor, Message } = require("../models");

const sendMessageToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { content, sender } = req.body;

    // Validate input
    if (!sender || !content) {
      return res
        .status(400)
        .json({ message: "Sender and content are required" });
    }

    // Find student by ID
    const student = await Student.findById(studentId).populate("user");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create and save the message in the Messages collection
    const message = new Message({
      sender,
      receiver: student.user._id,
      content,
    });
    await message.save();

    res.status(200).json({ message: "Message sent to student successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendStudentMessageToAdvisor = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Find student by ID
    const student = await Student.findById(studentId).populate(
      "user courseAdvisor"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create and save the message in the Messages collection
    const message = new Message({
      sender: student.user._id,
      receiver: student.courseAdvisor.user._id,
      content,
    });
    await message.save();

    res.status(200).json({ message: "Message sent to advisor successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMessagesFromStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch messages where the student is the receiver
    const messages = await Message.find({
      $or: [{ receiver: student.user._id }, { sender: student.user._id }],
    })
      .populate("sender receiver", "firstName lastName email role")
      .sort({ timestamp: -1 }); // Optionally sort by date

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendMessageToParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { sender, content } = req.body;

    // Validate input
    if (!sender || !content) {
      return res
        .status(400)
        .json({ message: "Sender and content are required" });
    }

    // Find parent by ID
    const parent = await Parent.findById(parentId).populate("user");
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Create and save the message in the Messages collection
    const message = new Message({
      sender,
      receiver: parent.user._id,
      content,
    });
    await message.save();

    res.status(200).json({ message: "Message sent to parent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sendParentMessageToAdvisor = async (req, res) => {
  try {
    const { parentId, advisorID } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Find parent by ID
    const parent = await Parent.findById(parentId).populate("user");
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Find advisor by ID
    const advisor = await CourseAdvisor.findById(advisorID).populate("user");
    if (!advisor) {
      return res.status(404).json({ message: "Advisor not found" });
    }

    // Create and save the message in the Messages collection
    const message = new Message({
      sender: parent.user._id,
      receiver: advisor.user._id,
      content,
    });
    await message.save();

    res.status(200).json({ message: "Message sent to advisor successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMessagesFromParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Find parent by ID
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Fetch messages where the parent is the receiver
    const messages = await Message.find({
      $or: [{ receiver: parent.user._id }, { sender: parent.user._id }],
    })
      .populate("sender receiver", "firstName lastName email role")
      .sort({ timestamp: -1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getMessagesForAdvisor = async (req, res) => {
  try {
    const advisorID = req.user._id;

    // Find advisor by ID
    const advisor = await CourseAdvisor.findOne({ user: advisorID });
    if (!advisor) {
      return res.status(404).json({ message: "Advisor not found" });
    }

    // Fetch messages for the advisor
    const messages = await Message.find({
      $or: [{ receiver: advisor.user._id }, { sender: advisor.user._id }],
    }).populate("sender receiver", "firstName lastName email role");

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendMessageToStudent,
  getMessagesFromStudent,
  sendMessageToParent,
  getMessagesFromParent,
  sendStudentMessageToAdvisor,
  sendParentMessageToAdvisor,
  getMessagesForAdvisor,
};
