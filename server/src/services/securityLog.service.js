import { User } from '../models/User.js';

const MAX_EVENTS = 50;

// Appends an entry to the user's security log (newest last, capped). Never
// throws: logging must not break the action being logged.
export async function logSecurityEvent(userId, req, type, detail = '') {
  try {
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          securityLog: {
            $each: [
              {
                type,
                detail: String(detail).slice(0, 200),
                at: new Date(),
                ip: req?.ip || null,
                userAgent: (req?.get?.('user-agent') || '').slice(0, 300),
              },
            ],
            $slice: -MAX_EVENTS,
          },
        },
      }
    );
  } catch {
    // swallow — see above
  }
}
