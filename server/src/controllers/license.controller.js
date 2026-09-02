import { License } from '../models/License.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/licenses/activate — the click path from Navbar's "Activate
// License" menu item / Settings page. requireAuth — activation is
// inherently tied to whichever account is redeeming the key.
//
// Admin-only generate/list logic now lives in
// controllers/admin/adminLicense.controller.js — this file is public-only.
export const activateLicense = asyncHandler(async (req, res) => {
  const { licenseKey } = req.body;
  if (!licenseKey || typeof licenseKey !== 'string') {
    throw ApiError.badRequest('licenseKey is required');
  }

  const license = await License.findOne({ key: licenseKey.trim().toUpperCase() });
  if (!license) throw ApiError.notFound('Invalid license key');
  if (license.isUsed) throw ApiError.conflict('This license key has already been activated');

  license.isUsed = true;
  license.usedBy = req.user.id;
  license.activatedAt = new Date();
  await license.save();

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      isPro: true,
      proExpiresAt: license.expiresAt,
      proPlan: 'license-key',
    },
    { new: true }
  );

  new ApiResponse(200, { user: user.toPublicJSON() }, 'Pro activated').send(res);
});
