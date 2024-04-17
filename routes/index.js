const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const studentController = require('../controllers/student');
const courseController = require('../controllers/course');

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

module.exports = router;
