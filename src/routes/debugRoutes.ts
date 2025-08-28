import { Router } from 'express';
import { debugAuth, testConnection } from '../controllers/debugController';

const router = Router();

// Debug routes
router.post('/auth', debugAuth);
router.get('/connection', testConnection);

export default router;
