const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { uploadLogo: uploadLogoMulter } = require('../config/multer');
const {
  getAdminDoctors, approveDoctor, rejectDoctor,
  getAdminUsers, toggleUserActive,
  getAdminAppointments, getAdminStats,
  getSettings, updateSettings, uploadLogo, getStorageInfo
} = require('../controllers/adminController');

router.use(authenticate);
router.use(checkRole('admin'));

router.get('/doctors', getAdminDoctors);
router.patch('/doctors/:id/approve', approveDoctor);
router.patch('/doctors/:id/reject', rejectDoctor);

router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle', toggleUserActive);

router.get('/appointments', getAdminAppointments);
router.get('/stats', getAdminStats);
router.get('/storage', getStorageInfo);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.post('/upload/logo', uploadLogoMulter.single('logo'), uploadLogo);

module.exports = router;
