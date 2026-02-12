import { Router } from 'express';
import { fetchAllUsers } from '../controllers/user.controller';

const router = Router();

// GET /api/acc/user/fetch
router.get('/fetch', fetchAllUsers);

export default router;
