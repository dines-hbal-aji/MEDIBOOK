const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { createPrescription, getMyPrescriptions, getPrescriptionByAppointment } = require('../controllers/prescriptionController');

router.use(authenticate);

router.post('/', checkRole('doctor'), createPrescription);
router.get('/my', checkRole('user'), getMyPrescriptions);
router.get('/:appointmentId', getPrescriptionByAppointment);

module.exports = router;
