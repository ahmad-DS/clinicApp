import { Router } from 'express';
import { createPatient, searchPatients, getPatientById } from '../controllers/patient.controller';

const router = Router();

router.get('/', searchPatients);       // GET /api/patients?query=John
router.get('/:id', getPatientById);   // GET /api/patients/:id
router.post('/', createPatient);       // POST /api/patients

export default router;