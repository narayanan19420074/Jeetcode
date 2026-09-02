import { AdminActionLog } from '../models/AdminActionLog.js';

// Writes one AdminActionLog row per destructive/notable admin action.
// Awaited (not truly "fire and forget") so the log is durable before the
// response is sent, but wrapped in try/catch so a broken audit sink can
// never fail the actual admin action it's trying to record.
export async function logAdminAction(req, { action, targetType, targetId = null, metadata = {} }) {
  try {
    await AdminActionLog.create({ admin: req.user.id, action, targetType, targetId, metadata });
  } catch (err) {
    console.error('Failed to write AdminActionLog:', err);
  }
}
