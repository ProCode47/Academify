const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/auth');
const studentController = require('../controllers/student');
const courseController = require('../controllers/course');
const uploadController = require('../controllers/result');
const semesterController = require('../controllers/semester');

// Multer middleware setup to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Register courses for a student
router.post('/register', courseController.registerCourses);

// Register routes
router.post('/register/student', authController.registerStudent);
router.post('/register/parent', authController.registerParent);
router.post('/register/courseadvisor', authController.registerCourseAdvisor);

// Login routes
router.post('/login/student', authController.loginStudent);
router.post('/login/parent', authController.loginParent);
router.post('/login/courseadvisor', authController.loginCourseAdvisor);

// Student routes
router.get('/student/:regNo', studentController.getStudentByRegNo);

// Courses routes
router.post('/course/register', courseController.registerCourses);

// Result routes
router.post('/upload', upload.single('file'), uploadController.uploadResult);

// Semester routes
router.post('/semester/create', semesterController.createSemester);

module.exports = router;
