const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const studentController = require('../controllers/student');
const courseController = require('../controllers/course');
const messageController = require('../controllers/messages')
const parentController = require('../controllers/parent')
const courseAdvisorController = require('../controllers/courseAdvisor');
const courseCoordinatorController = require('../controllers/courseCoordinator');
const resultController = require('../controllers/result');
const semesterController = require('../controllers/semester');
const authenticate = require('../middleware/authMiddleware');


// Register routes
router.post('/register/student', authController.registerStudent);
router.post('/register/parent', authController.registerParent);
router.post('/register/courseadvisor', authController.registerCourseAdvisor);
router.post('/register/coursecoordinator', authController.registerCourseCoordinator);

// Login routes
router.post('/login/student', authController.loginStudent);
router.post('/login/parent', authController.loginParent);
router.post('/login/courseadvisor', authController.loginCourseAdvisor);
router.post('/login/coursecoordinator', authController.loginCourseCoordinator);

// Student routes
router.get('/student/profile', authenticate, studentController.getStudentByRegNo);
router.get('/student/result', authenticate, resultController.getStudentResult);
router.get('/student/latest-result', authenticate, resultController.getLatestResults);

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
router.post('/api/messages/parent/advisor/:parentId/:advisorID', messageController.sendParentMessageToAdvisor);
router.get('/api/messages/parent/:parentId', messageController.getMessagesFromParent);

// get messages for advisors
router.get('/api/messages/advisor', authenticate,  messageController.getMessagesForAdvisor);

// Profile Routes for course advisor
router.get('/profile/advisors', authenticate, courseAdvisorController.getProfile);
router.put('/advisors/update-password', authenticate, courseAdvisorController.updatePassword);
router.put('/advisors/update', authenticate, courseAdvisorController.updateProfile);

// Profile Routes for Course Coordinators
router.get('/profile/coordinators', authenticate, courseCoordinatorController.getCoordinatorProfile);
router.put('/coordinators/update-password', authenticate, courseCoordinatorController.updateCoordinatorPassword);
router.put('/coordinators/update-profile', authenticate, courseCoordinatorController.updateCoordinatorProfile);

// Coordinator Routes for Adding, removing and editing courses
router.post("/coordinators/add-courses", authenticate, courseCoordinatorController.addCoursesToCoordinator);
router.post("/coordinators/remove-courses", authenticate, courseCoordinatorController.removeCoursesFromCoordinator);
router.put("/coordinators/edit-courses", authenticate, courseCoordinatorController.editCoursesForCoordinator);

// Route to get all course coordinators
router.get('/coordinators/get-all', courseCoordinatorController.getAllCourseCoordinators);

// Route to get all courses under a course coordinator
router.get('/coordinators/get-courses', authenticate, courseCoordinatorController.getAllCoursesUnderCourseCoordinator);

// Route to get all course advisors
router.get('/advisors/get-all', courseAdvisorController.getAllCourseAdvisors);

// Route to get all students under a course advisor
router.get('/advisors/students', authenticate, courseAdvisorController.getAllStudentsUnderCourseAdvisor);

// Route to upload results 
router.post('/coordinators/upload-results', authenticate, resultController.uploadResults);

// Route to view results
router.get('/advisors/view-results', authenticate, resultController.viewResults);

// Route to create semester
router.post('/advisors/semesters', authenticate, semesterController.createSemester);

// Route to get a semester by session and name
router.get('/advisors/semesters', authenticate, semesterController.getSemesters);

//Parent routes
router.get('/parent/profile',authenticate, parentController.getProfile);
router.post('/parent/editProfile',authenticate, parentController.editProfile)
router.post('/parent/addChild',authenticate, parentController.addChild)
router.post('/parent/getChildResult',authenticate, parentController.getChildResult)
router.post('/parent/getLatestChildResult',authenticate, parentController.getLatestChildResult)

module.exports = router;
