import { Router } from 'express';
import { addMedicalHistory, getPatientMedicalHistory } from '../controllers/history.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Expects fields up to 10 images concurrently inside a field key called 'images'
router.post('/:patient_id/history', upload.array('images', 10), addMedicalHistory);

// GET: Fetch complete history timeline for a patient
router.get('/:patient_id/history', getPatientMedicalHistory);

export default router;