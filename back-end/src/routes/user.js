const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { uploadCertificate } = require('../config/multer');
const {
  createSlots, deleteSlot, getMySlots,
  getDoctorProfile, updateDoctorProfile,
  getDoctorAppointments, completeAppointment
} = require('../controllers/slotController');

router.use(authenticate);
router.use(checkRole('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile', uploadCertificate.single('certificate'), updateDoctorProfile);
router.post('/slots', createSlots);
router.get('/slots', getMySlots);
router.delete('/slots/:id', deleteSlot);
router.get('/appointments', getDoctorAppointments);
router.patch('/appointments/:id/complete', completeAppointment);

module.exports = router;
