import { Router } from 'express';
import { getQuests, claimQuest } from '../controllers/quest.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', attachUserIfPresent, getQuests);
router.post('/:id/claim', requireAuth, claimQuest);

export default router;
