import { Router } from 'express';
import {
  listCompanies,
  getCompanyRoadmap,
  enrollInCompany,
  updateSectionProgress,
} from '../controllers/prep.controller.js';
import { attachUserIfPresent, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/companies', attachUserIfPresent, listCompanies);
router.get('/companies/:slug', attachUserIfPresent, getCompanyRoadmap);
router.post('/companies/:slug/enroll', requireAuth, enrollInCompany);
router.post('/companies/:slug/sections/:sectionId/progress', requireAuth, updateSectionProgress);

export default router;
