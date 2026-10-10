import { Router } from 'express';
import {
  getActivityHeatmap,
  toggleBookmark,
  updateProfile,
  updatePreferences,
  getAccount,
  changePassword,
  changeHandle,
  getSecurityLog,
  exportData,
  deleteAccount,
} from '../controllers/user.controller.js';
import { requireAuth, loadFullUser } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  updateProfileSchema,
  preferencesPatchSchema,
  changePasswordSchema,
  changeHandleSchema,
  deleteAccountSchema,
} from '../validators/user.validator.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/me/activity', requireAuth, loadFullUser, getActivityHeatmap);
router.post('/me/bookmarks/:problemId', requireAuth, loadFullUser, toggleBookmark);

// Settings
router.get('/me/account', requireAuth, getAccount);
router.patch('/me/profile', requireAuth, loadFullUser, validate(updateProfileSchema), updateProfile);
router.patch('/me/preferences', requireAuth, validate(preferencesPatchSchema), updatePreferences);
router.patch('/me/password', requireAuth, loadFullUser, authLimiter, validate(changePasswordSchema), changePassword);
router.patch('/me/handle', requireAuth, loadFullUser, validate(changeHandleSchema), changeHandle);
router.get('/me/security-log', requireAuth, getSecurityLog);
router.get('/me/export', requireAuth, exportData);
router.post('/me/delete', requireAuth, authLimiter, validate(deleteAccountSchema), deleteAccount);

export default router;
