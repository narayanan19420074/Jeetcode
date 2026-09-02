import { Router } from 'express';
import { activateLicense } from '../controllers/license.controller.js';
import { validate } from '../middlewares/validate.js';
import { activateLicenseSchema } from '../validators/license.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

// Admin generate/list routes now live at routes/admin/adminLicenses.routes.js,
// mounted under /api/admin/licenses. This file stays public-only.
const router = Router();

router.post('/activate', requireAuth, validate(activateLicenseSchema), activateLicense);

export default router;
