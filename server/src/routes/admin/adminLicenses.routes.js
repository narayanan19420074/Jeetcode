import { Router } from 'express';
import { adminGenerateLicenses, adminListLicenses } from '../../controllers/admin/adminLicense.controller.js';
import { validate } from '../../middlewares/validate.js';
import { generateLicensesSchema } from '../../validators/license.validator.js';

// Mounted at /api/admin/licenses in admin.routes.js — requireAuth +
// requireRole('admin') already applied there via router.use().
const router = Router();

router.post('/generate', validate(generateLicensesSchema), adminGenerateLicenses);
router.get('/', adminListLicenses);

export default router;
