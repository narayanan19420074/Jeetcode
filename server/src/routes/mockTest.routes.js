import { Router } from 'express';
import { listMocks, startMock, getPaper, save, submitSection, submitAll, getResult } from '../controllers/mockTest.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { checkProAccess } from '../middlewares/checkProAccess.middleware.js';

const router = Router();

router.get('/', requireAuth, checkProAccess, listMocks);
router.post('/:paperId/start', requireAuth, checkProAccess, startMock);

router.get('/attempts/:attemptId/paper', requireAuth, getPaper);
router.post('/attempts/:attemptId/save', requireAuth, save);
router.post('/attempts/:attemptId/section-submit', requireAuth, submitSection);
router.post('/attempts/:attemptId/submit', requireAuth, submitAll);
router.get('/attempts/:attemptId/result', requireAuth, getResult);

export default router;
