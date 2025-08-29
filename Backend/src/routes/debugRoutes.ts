import { Router } from 'express';
import { debugAuth, testConnection, getAdminUsers } from '../controllers/debugController';

const router = Router();

// Debug routes
router.post('/auth', debugAuth);
router.get('/connection', testConnection);
router.get('/admin-users', getAdminUsers);

export default router;
