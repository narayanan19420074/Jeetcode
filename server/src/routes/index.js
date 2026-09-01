import { Router } from 'express';
import authRoutes from './auth.routes.js';
import problemRoutes from './problem.routes.js';
import submissionRoutes from './submission.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import aiRoutes from './ai.routes.js';
import aptitudeRoutes from './aptitude.routes.js'; 
import billingRoutes from './billing.routes.js';
import licenseRoutes from './license.routes.js';
import prepRoutes from './prep.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'JeetCode API is up' }));

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/billing', billingRoutes);
router.use('/submissions', submissionRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/aptitude', aptitudeRoutes); 
router.use('/licenses', licenseRoutes);
router.use('/prep', prepRoutes);


export default router;
