import { Router } from 'express';
import { bookAppointment, getAppointmentsByDate } from '../controllers/appointment.controller';

const router = Router();

router.post('/', bookAppointment);       // POST /api/appointments
router.get('/', getAppointmentsByDate);   // GET /api/appointments?date=2026-06-09

export default router;