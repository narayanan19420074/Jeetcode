import { Router } from 'express';
import { getQuests, claimQuest, unlockButterfly, equipButterfly } from '../controllers/quest.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', attachUserIfPresent, getQuests);
router.post('/butterflies/:id/unlock', requireAuth, unlockButterfly);
router.post('/butterflies/:id/equip', requireAuth, equipButterfly);
router.post('/:id/claim', requireAuth, claimQuest);

export default router;
