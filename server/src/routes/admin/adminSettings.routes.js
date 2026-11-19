import { Router } from 'express';
import { adminGetSettings, adminSetProForEveryone } from '../../controllers/admin/adminSettings.controller.js';
import { validate } from '../../middlewares/validate.js';
import { setProForEveryoneSchema } from '../../validators/admin/platformSettings.validator.js';
import { requireFreshRole } from '../../middlewares/auth.middleware.js';

// Mounted at /api/admin/settings in admin.routes.js — requireAuth +
// requireRole('admin') are already applied there.
const router = Router();

router.get('/', adminGetSettings);

// Granting Pro to every account is as sensitive as a manual Pro grant, so it
// re-checks the admin's role in the database (see adminUsers.routes.js).
router.patch('/pro-for-everyone', requireFreshRole('admin'), validate(setProForEveryoneSchema), adminSetProForEveryone);

export default router;
