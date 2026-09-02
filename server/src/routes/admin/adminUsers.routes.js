import { Router } from 'express';
import { adminListUsers, adminUpdateUserRole, adminSetUserPro } from '../../controllers/admin/adminUser.controller.js';
import { validate } from '../../middlewares/validate.js';
import { updateUserRoleSchema, setUserProSchema, listUsersQuerySchema } from '../../validators/admin/user.validator.js';
import { requireFreshRole } from '../../middlewares/auth.middleware.js';

// Mounted at /api/admin/users in admin.routes.js — requireAuth +
// requireRole('admin') already applied there via router.use(), so this
// sub-router only adds the stricter requireFreshRole where needed.
const router = Router();

router.get('/', validate(listUsersQuerySchema, 'query'), adminListUsers);

// Role changes and manual Pro grants are sensitive enough to warrant the
// same requireFreshRole check as destructive problem actions — a demoted
// admin shouldn't be able to keep promoting accounts until their stale
// token expires.
router.patch('/:id/role', requireFreshRole('admin'), validate(updateUserRoleSchema), adminUpdateUserRole);
router.patch('/:id/pro', requireFreshRole('admin'), validate(setUserProSchema), adminSetUserPro);

export default router;
