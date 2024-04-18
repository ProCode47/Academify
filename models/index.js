const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define User schema (common for all roles)
const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'parent', 'course_advisor'], required: true },
}, { timestamps: true });

// Define Student schema
const studentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reg: { type: String, required: true },
    level: {type: Number, required: true}
    // Add other student-specific fields if needed
}, { timestamps: true });

// Define Parent schema
const parentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    child: { type: Schema.Types.ObjectId, ref: 'Student', required: true}
    // Add other parent-specific fields if needed
}, { timestamps: true });

// Define Course Advisor schema
const courseAdvisorSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Add other course advisor-specific fields if needed
}, { timestamps: true });

// Define Course schema
const courseSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    // Add other course fields if needed
}, { timestamps: true });

// Define Result schema
const resultSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    grade: { type: String, required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    // Add other result fields if needed
}, { timestamps: true });

// Define Semester schema
const semesterSchema = new Schema({
    name: { type: String, enum: ['Harmattan', 'Rain'], required: true },
    session: {type: String, required: true}
    // Add other semester fields if needed
}, { timestamps: true });

// Define Comments schema
const commentSchema = new Schema({
    comments: [
        { 
            author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            comment: {type: String, required: true } 
        }
    ],
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true }
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Parent = mongoose.model('Parent', parentSchema);
const CourseAdvisor = mongoose.model('CourseAdvisor', courseAdvisorSchema);
const Course = mongoose.model('Course', courseSchema);
const Result = mongoose.model('Result', resultSchema);
const Semester = mongoose.model('Semester', semesterSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Notification = mongoose.model('Notification', notificationSchema)

module.exports = { User, Student, Parent, CourseAdvisor, Course, Result, Semester, Comment, Notification };
