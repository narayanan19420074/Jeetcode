import { Router } from 'express';
import { activateLicense, adminGenerateLicenses, adminListLicenses } from '../controllers/license.controller.js';
import { validate } from '../middlewares/validate.js';
import { activateLicenseSchema, generateLicensesSchema } from '../validators/license.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/activate', requireAuth, validate(activateLicenseSchema), activateLicense);

export default router;

// Mount under /api/admin/licenses in routes/index.js, wrapped with the
// same requireRole('admin') guard used for other admin sub-routers.
export const adminLicenseRouter = Router();
adminLicenseRouter.post('/generate', validate(generateLicensesSchema), adminGenerateLicenses);
adminLicenseRouter.get('/', adminListLicenses);
