import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { googleSignIn, githubSignIn, linkedinSignIn } from '../controllers/oauth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { requireAuth, loadFullUser } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, googleSignIn);
router.post('/github', authLimiter, githubSignIn);
router.post('/linkedin', authLimiter, linkedinSignIn);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, loadFullUser, me);

export default router;
