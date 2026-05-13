const express = require('express');
const router = express.Router();
const { register, registerDoctor, login, logout, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadCertificate } = require('../config/multer');

router.post('/register', register);
router.post('/register-doctor', uploadCertificate.single('certificate'), registerDoctor);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

module.exports = router;
