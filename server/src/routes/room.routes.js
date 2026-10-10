import { Router } from 'express';
import { LANGUAGE_IDS } from '../services/judge0.service.js';
import { createRoom, getRoom, MAX_PEERS } from '../realtime/roomStore.js';

const router = Router();
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : undefined);

// Guests allowed: no auth middleware on purpose. The global /api rate limiter still applies.
router.post('/', (req, res) => {
  const body = req.body || {};
  const language = LANGUAGE_IDS[body.language] ? body.language : 'javascript';

  let starters;
  if (body.starters && typeof body.starters === 'object') {
    starters = {};
    for (const l of Object.keys(LANGUAGE_IDS)) {
      const s = str(body.starters[l], 20000);
      if (s !== undefined) starters[l] = s;
    }
  }

  const room = createRoom({
    language,
    problemSlug: str(body.problemSlug, 200),
    title: str(body.title, 150),
    starters,
    initialCode: str(body.initialCode, 20000),
  });
  if (!room) return res.status(503).json({ success: false, message: 'Too many active rooms right now. Try again in a bit.' });
  res.status(201).json({ success: true, data: { roomId: room.id } });
});

router.get('/:id', (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found or expired' });
  res.json({
    success: true,
    data: { id: room.id, language: room.language, problemSlug: room.problemSlug, title: room.title, peers: room.peers.size, full: room.peers.size >= MAX_PEERS },
  });
});

export default router;
