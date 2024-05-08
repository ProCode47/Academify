const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const studentController = require('../controllers/student');
const courseController = require('../controllers/course');
const messageController = require('../controllers/messages')
const parentController = require('../controllers/parent')
const courseAdvisorController = require('../controllers/courseAdvisor');
const resultController = require('../controllers/result');
const authenticate = require('../middleware/authMiddleware');


// Register routes
router.post('/register/student', authController.registerStudent);
router.post('/register/parent', authController.registerParent);
router.post('/register/courseadvisor', authController.registerCourseAdvisor);

// Login routes
router.post('/login/student', authController.loginStudent);
router.post('/login/parent', authController.loginParent);
router.post('/login/courseadvisor', authController.loginCourseAdvisor);

// Student routes
router.get('/student/profile', authenticate, studentController.getStudentByRegNo);
router.get('/student/result', authenticate, resultController.getStudentResult);

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
router.post('/api/messages/parent/advisor/:parentId/:advisorId', messageController.sendParentMessageToAdvisor);
router.get('/api/messages/parent/:parentId', messageController.getMessagesFromParent);

// Profile Routes for course advisor
router.get('/profile/advisors', authenticate, courseAdvisorController.getProfile);
router.put('/advisors/update-password', authenticate, courseAdvisorController.updatePassword);

// Route to get all course advisors
router.get('/advisors/get-all', courseAdvisorController.getAllCourseAdvisors);

// Route to upload results 
router.post('/advisors/upload-results', authenticate, resultController.uploadResults);

//Parent routes
router.get('/parent/profile',authenticate, parentController.getProfile);
router.post('/parent/editProfile',authenticate, parentController.editProfile)
router.post('/parent/addChild',authenticate, parentController.addChild)
router.get('/parent/getChildResult',authenticate, parentController.getChildResult)

module.exports = router;
