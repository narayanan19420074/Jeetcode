import crypto from 'crypto';
import { License } from '../models/License.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/licenses/activate — the click path from Navbar's "Activate
// License" menu item / Settings page. requireAuth — activation is
// inherently tied to whichever account is redeeming the key.
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

// --- Admin ---

// POST /api/admin/licenses/generate — { count, expiresAt?, note? } ->
// creates `count` fresh unused keys and returns them so an admin can
// distribute them (email, print for a college outreach event, etc).
export const adminGenerateLicenses = asyncHandler(async (req, res) => {
  const { count = 1, expiresAt, note } = req.body;
  if (count < 1 || count > 500) throw ApiError.badRequest('count must be between 1 and 500');

  const keys = Array.from({ length: count }, () => ({
    key: generateKey(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    note: note || null,
  }));

  const created = await License.insertMany(keys);
  new ApiResponse(201, { items: created.map((l) => l.key) }, `${created.length} license keys generated`).send(res);
});

// GET /api/admin/licenses — list all, most recent first, for the admin
// console's license management view.
export const adminListLicenses = asyncHandler(async (req, res) => {
  const licenses = await License.find().sort({ createdAt: -1 }).populate('usedBy', 'name email handle').lean();
  new ApiResponse(200, { items: licenses }).send(res);
});

// "JEET-XXXX-XXXX-XXXX" — crypto.randomBytes for unpredictability (not
// Math.random), grouped for readability when someone types it manually.
function generateKey() {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `JEET-${segment()}-${segment()}-${segment()}`;
}
