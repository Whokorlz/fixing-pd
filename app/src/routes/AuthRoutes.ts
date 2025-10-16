import { Router } from 'express';
import { login } from '../controllers/AuthController';

const router = Router();

// Endpoint for user login (POST /api/auth/login)
router.post('/login', login);

export default router;