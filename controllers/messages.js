const { User, Student, Parent, CourseAdvisor } = require("../models");

const sendMessageToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { sender, content } = req.body;

    // Validate input
    if (!sender || !content) {
      return res
        .status(400)
        .json({ message: "Sender and content are required" });
    }

    // Find student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Store the message
    student.messages.push({ sender, receiver: student.user, content });
    await student.save();

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
      return res
        .status(400)
        .json({ message: "Sender and content are required" });
    }

    // Find student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Store the message
    student.messages.push({
      sender: student.user,
      receiver: student.courseAdvisor,
      content,
    });
    await student.save();

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

    // Fetch messages from the student
    const messages = student.messages;

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
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Store the message
    parent.messages.push({ sender, receiver: parent.user, content });
    await parent.save();

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
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Find advisor by ID
    const advisor = await CourseAdvisor.findById(advisorID);
    if (!advisor) {
      return res.status(404).json({ message: "Advisor not found" });
    }

    // Check if the parent ID already exists in the parents array of the advisor
    if (!advisor.parents.includes(parentId)) {
      // Add the parent ID to the parents array
      advisor.parents.push(parentId);
      // Save the changes to the advisor
      await advisor.save();
    }

    // Store the message
    parent.messages.push({
      sender: parent.user,
      receiver: advisor.user,
      content,
    });
    await parent.save();

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

    // Fetch messages from the parent
    const messages = parent.messages;

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
};
