import { Router } from 'express';
import { registerAccommodation, getAccommodationByUniqueId, getAccommodationByEmail, updatePaymentStatus, getAccommodationStats, getAllAccommodations } from '../controllers/accommodation.controller';

const router = Router();

// POST /api/accommodation/register
router.post('/register', registerAccommodation);

// GET /api/accommodation/uniqueId/:uniqueId
router.get('/uniqueId/:uniqueId', getAccommodationByUniqueId);

// GET /api/accommodation/email/:email
router.get('/email/:email', getAccommodationByEmail);

// PUT /api/accommodation/payment/:uniqueId
router.put('/payment/:uniqueId', updatePaymentStatus);

// GET /api/accommodation/stats
router.get('/stats', getAccommodationStats);

// GET /api/accommodation/all
router.get('/all', getAllAccommodations);

export default router;
