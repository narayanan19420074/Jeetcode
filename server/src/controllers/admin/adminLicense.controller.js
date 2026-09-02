import crypto from 'crypto';
import { License } from '../../models/License.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logAdminAction } from '../../utils/adminAudit.js';

// "JEET-XXXX-XXXX-XXXX" — crypto.randomBytes for unpredictability (not
// Math.random), grouped for readability when someone types it manually.
function generateKey() {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `JEET-${segment()}-${segment()}-${segment()}`;
}

// POST /api/admin/licenses/generate — { count, expiresAt?, note? } ->
// creates `count` fresh unused keys. UI only ever asks for count: 1 (single
// key generator per product decision), but the endpoint stays generic so
// nothing has to change if bulk generation is added later.
export const adminGenerateLicenses = asyncHandler(async (req, res) => {
  const { count = 1, expiresAt, note } = req.body;
  if (count < 1 || count > 500) throw ApiError.badRequest('count must be between 1 and 500');

  const keys = Array.from({ length: count }, () => ({
    key: generateKey(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    note: note || null,
  }));

  const created = await License.insertMany(keys);

  await logAdminAction(req, {
    action: 'license_generate',
    targetType: 'License',
    metadata: { count: created.length, keys: created.map((l) => l.key), expiresAt: expiresAt || null, note: note || null },
  });

  new ApiResponse(201, { items: created.map((l) => l.key) }, `${created.length} license key(s) generated`).send(res);
});

// GET /api/admin/licenses — list all, most recent first, for the Licenses
// section table (status: used/unused, who redeemed it, when).
export const adminListLicenses = asyncHandler(async (req, res) => {
  const licenses = await License.find().sort({ createdAt: -1 }).populate('usedBy', 'name email handle').lean();
  new ApiResponse(200, { items: licenses }).send(res);
});
