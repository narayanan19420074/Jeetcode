import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { logAdminAction } from '../../utils/adminAudit.js';
import { getPlatformSettings, setProForEveryone } from '../../services/platformSettings.service.js';

// GET /api/admin/settings
export const adminGetSettings = asyncHandler(async (req, res) => {
  new ApiResponse(200, await getPlatformSettings()).send(res);
});

// PATCH /api/admin/settings/pro-for-everyone — { enabled }
export const adminSetProForEveryone = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const settings = await setProForEveryone({ enabled, adminId: req.user.id });

  await logAdminAction(req, {
    action: 'platform_setting_update',
    targetType: 'PlatformSetting',
    metadata: { setting: 'proForEveryone', enabled },
  });

  const message = enabled ? 'Pro enabled for all users' : 'Pro for all users turned off';
  new ApiResponse(200, settings, message).send(res);
});
