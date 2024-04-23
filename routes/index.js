const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const studentController = require('../controllers/student');
const courseController = require('../controllers/course');
const messageController = require('../controllers/messages')
const courseAdvisorController = require('../controllers/courseAdvisor');
const resultController = require('../controllers/result');
const authenticate = require('../middleware/authMiddleware');

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
router.get('/course/load', courseController.loadCourses);
router.post('/course/register', courseController.registerCourses);
router.get('/courses/:level/:semester', courseController.getCoursesByLevelAndSemester);

// messaging between course advisor and student
router.post('/api/messages/student/:studentId', messageController.sendMessageToStudent);
router.post('/api/messages/student/advisor/:studentId', messageController.sendStudentMessageToAdvisor);
router.get('/api/messages/student/:studentId', messageController.getMessagesFromStudent);

// messaging between parent and course advisor
router.post('/api/messages/parent/:parentId', messageController.sendMessageToParent);
router.post('/api/messages/parent/advisor/:studentId', messageController.sendParentMessageToAdvisor);
router.get('/api/messages/parent/:parentId', messageController.getMessagesFromParent);

// Profile Routes for course advisor
router.get('/profile', courseAdvisorController.getProfile);
router.put('/update-password', authenticate, courseAdvisorController.updatePassword);

// Route to upload results (requires authentication)
router.post('/upload-results', authenticate, resultController.uploadResults);

module.exports = router;
