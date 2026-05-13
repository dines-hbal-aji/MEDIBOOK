const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const {
  bookAppointment, getMyAppointments, getAppointmentById,
  cancelAppointment, rescheduleAppointment, completeAppointment
} = require('../controllers/appointmentController');

router.use(authenticate);

router.post('/', checkRole('user'), bookAppointment);
router.get('/my', checkRole('user'), getMyAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/cancel', checkRole('user'), cancelAppointment);
router.patch('/:id/reschedule', checkRole('user'), rescheduleAppointment);
router.patch('/:id/complete', checkRole('user'), completeAppointment);

module.exports = router;
