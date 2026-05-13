const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, getDoctorSlots } = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

module.exports = router;
