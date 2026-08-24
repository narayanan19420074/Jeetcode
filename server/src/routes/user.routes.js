import { Router } from 'express';
import { getActivityHeatmap, toggleBookmark } from '../controllers/user.controller.js';
import { requireAuth, loadFullUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me/activity', requireAuth, loadFullUser, getActivityHeatmap);
router.post('/me/bookmarks/:problemId', requireAuth, loadFullUser, toggleBookmark);

export default router;
