import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller.js';
import { forgotPassword, resetPassword, resetPasswordWithCode, verifyEmail, resendVerification } from '../controllers/accountEmail.controller.js';
import { listSessions, revokeSession, revokeOtherSessions } from '../controllers/sessions.controller.js';
import { adminLogin } from '../controllers/adminAuth.controller.js';
import { googleSignIn, githubSignIn, linkedinSignIn } from '../controllers/oauth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, resetPasswordCodeSchema, verifyEmailSchema } from '../validators/auth.validator.js';
import { requireAuth, loadFullUser } from '../middlewares/auth.middleware.js';
import { authLimiter, emailLimiter } from '../middlewares/rateLimiter.js';
import { verifyTurnstile } from '../middlewares/verifyTurnstile.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), verifyTurnstile, register);
router.post('/login', authLimiter, validate(loginSchema), verifyTurnstile, login);
// Separate admin-only entry point — same request shape/validator as the
// general login, but adminLogin() rejects any non-admin account. Kept in
// this same router (not a new top-level mount) so it inherits authLimiter
// and lives next to the endpoint it parallels.
router.post('/admin-login', authLimiter, validate(loginSchema), verifyTurnstile, adminLogin);
// Forgot password / email verification. The token endpoints use authLimiter (failed
// guesses count); the ones that send mail use emailLimiter.
router.post('/forgot-password', emailLimiter, validate(forgotPasswordSchema), verifyTurnstile, forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/reset-password-code', authLimiter, validate(resetPasswordCodeSchema), resetPasswordWithCode);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', emailLimiter, requireAuth, loadFullUser, resendVerification);
router.post('/google', authLimiter, googleSignIn);
router.post('/github', authLimiter, githubSignIn);
router.post('/linkedin', authLimiter, linkedinSignIn);
// No authLimiter here: every page reload calls /refresh, so counting it against
// the 20-per-15-min brute-force budget logged users out after ~20 reloads.
// It still sits behind generalLimiter and needs a valid signed cookie.
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, loadFullUser, me);

// Settings -> Sessions (under /auth so the path-scoped refresh cookie is sent)
router.get('/sessions', requireAuth, listSessions);
router.delete('/sessions', requireAuth, revokeOtherSessions);
router.delete('/sessions/:id', requireAuth, revokeSession);

export default router;
