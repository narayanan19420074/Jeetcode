import { Router } from 'express';
import { getMemberJobProfileById, getMyJobProfile, saveMyJobProfile } from '../controllers/jobProfile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { saveJobProfileSchema } from '../validators/jobProfile.validator.js';

const router = Router();

// Only the owner can change a profile. Any signed-in member can read one; there is no anonymous access.
router.use(requireAuth);
router.get('/me', getMyJobProfile);
router.put('/me', validate(saveJobProfileSchema), saveMyJobProfile);
router.get('/:userId', getMemberJobProfileById);

export default router;
