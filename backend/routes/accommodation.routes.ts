import { Router } from 'express';
import { registerAccommodation, getAccommodationByUniqueId, getAccommodationByEmail, getAccommodationStats, getAllAccommodations, updateAccommodation } from '../controllers/accommodation.controller';

const router = Router();

// POST /api/accommodation/register
router.post('/register', registerAccommodation);

// GET /api/accommodation/uniqueId/:uniqueId
router.get('/uniqueId/:uniqueId', getAccommodationByUniqueId);

// GET /api/accommodation/email/:email
router.get('/email/:email', getAccommodationByEmail);

// GET /api/accommodation/stats
router.get('/stats', getAccommodationStats);

// GET /api/accommodation/all
router.get('/all', getAllAccommodations);

// PUT /api/accommodation/update/:uniqueId
router.put('/update/:uniqueId', updateAccommodation);

export default router;
