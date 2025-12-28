import { Router } from 'express';
import { createDeskSession, refreshDeskSession } from '../controllers/desk.controller';

const router = Router();

// Create a new desk session
router.post('/create', createDeskSession);

// Refresh desk session
router.post('/refresh', refreshDeskSession);

export default router;
