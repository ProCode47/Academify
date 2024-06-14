const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define User schema (common for all roles)
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "parent", "course_advisor"],
      required: true,
    },
  },
  { timestamps: true }
);

// Define Student schema
const studentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reg: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Array to store registered courses
    courseAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseAdvisor",
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Add other student-specific fields if needed
  },
  { timestamps: true }
);

// Define Parent schema
const parentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    // Add other parent-specific fields if needed
  },
  { timestamps: true }
);

// Define Course Advisor schema
const courseAdvisorSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent",
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Add other course advisor-specific fields if needed
    photo: {
      type: String, // Assuming you store the URL of the photo
      required: false,
    },
    level: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Define a virtual to populate the name field based on the user's first and last name
courseAdvisorSchema.virtual("name").get(function () {
  return `${this.user.firstName} ${this.user.lastName}`;
});

// Define Course schema
const courseSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    type: { type: String, required: true, default: "Complusory" },
    // Add other course fields if needed
  },
  { timestamps: true }
);

// Define Result schema
const resultSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    grade: { type: String, required: true },
    semester: { type: Schema.Types.ObjectId, ref: "Semester", required: true },
    // Add other result fields if needed
  },
  { timestamps: true }
);

// Define Semester schema
const semesterSchema = new Schema({
    name: { type: String, enum: ['Harmattan', 'Rain'], required: true },
    session: {type: String, required: true},
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }]
    // Add other semester fields if needed
}, { timestamps: true });

// Define Notification schema
const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    notification: [
        { 
            message: {type: String, required: true },
            status: { type: String, enum: ['read', 'unread'], required: true }
        }
    ]
    // Add other semester fields if needed
  },
  { timestamps: true }
);

// Define Notification schema
const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notification: [
      {
        message: { type: String, required: true },
        status: { type: String, enum: ["read", "unread"], required: true },
      },
    ],
    // Add other semester fields if needed
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);
const Parent = mongoose.model("Parent", parentSchema);
const CourseAdvisor = mongoose.model("CourseAdvisor", courseAdvisorSchema);
const Course = mongoose.model("Course", courseSchema);
const Result = mongoose.model("Result", resultSchema);
const Semester = mongoose.model("Semester", semesterSchema);
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
  User,
  Student,
  Parent,
  CourseAdvisor,
  Course,
  Result,
  Semester,
  Notification,
};
