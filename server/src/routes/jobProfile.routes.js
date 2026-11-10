import { Router } from 'express';
import { getMyJobProfile, saveMyJobProfile } from '../controllers/jobProfile.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { saveJobProfileSchema } from '../validators/jobProfile.validator.js';

const router = Router();

// The Job profile is private to its owner for now: there is no public read route.
router.use(requireAuth);
router.get('/me', getMyJobProfile);
router.put('/me', validate(saveJobProfileSchema), saveMyJobProfile);

export default router;
