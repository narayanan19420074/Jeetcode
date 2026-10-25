import { Router } from 'express';
import { getQuests, claimQuest, convertCoins, upgradeButterfly } from '../controllers/quest.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', attachUserIfPresent, getQuests);
router.post('/convert', requireAuth, convertCoins);
router.post('/butterfly/upgrade', requireAuth, upgradeButterfly);
router.post('/:id/claim', requireAuth, claimQuest);

export default router;
