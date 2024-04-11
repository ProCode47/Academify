const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Register routes
router.post('/register/student', authController.registerStudent);
router.post('/register/parent', authController.registerParent);
router.post('/register/courseadvisor', authController.registerCourseAdvisor);

// Login routes
router.post('/login/student', authController.loginStudent);
router.post('/login/parent', authController.loginParent);
router.post('/login/courseadvisor', authController.loginCourseAdvisor);

module.exports = router;
