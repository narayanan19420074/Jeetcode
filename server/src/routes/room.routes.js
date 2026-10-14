import { Router } from 'express';
import { LANGUAGE_IDS } from '../services/judge0.service.js';
import { createRoom, getRoom, MAX_PEERS } from '../realtime/roomStore.js';
import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { assertPatternUnlocked } from '../services/aptitude.service.js';
import { attachUserIfPresent } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : undefined);

// Guests allowed for code rooms. Aptitude rooms need a logged-in creator, who must have the
// pattern unlocked; everyone who joins that room (guests too) can then use its questions.
router.post('/', attachUserIfPresent, asyncHandler(async (req, res) => {
  const body = req.body || {};

  if (body.kind === 'aptitude') {
    if (!req.user) throw ApiError.unauthorized('Login pannunga — aptitude room create panna account venum');
    const slug = str(body.patternSlug, 100);
    const pattern = slug ? await AptitudePattern.findOne({ slug, isPublished: true }) : null;
    if (!pattern) throw ApiError.notFound('Pattern not found');
    await assertPatternUnlocked(req.user.id, pattern);

    const room = createRoom({
      kind: 'aptitude',
      patternId: pattern._id,
      patternSlug: pattern.slug,
      language: 'javascript',
      title: str(body.title, 150) || `${pattern.title} study room`,
      initialCode: '',
    });
    if (!room) return res.status(503).json({ success: false, message: 'Too many active rooms right now. Try again in a bit.' });
    return res.status(201).json({ success: true, data: { roomId: room.id } });
  }
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
}));

// Aptitude room: browse the questions of the room's pattern (no answers in here).
router.get('/:id/questions', asyncHandler(async (req, res) => {
  const room = getRoom(req.params.id);
  if (!room || room.kind !== 'aptitude') return res.status(404).json({ success: false, message: 'Room not found or expired' });

  const q = req.query;
  const filter = { pattern: room.patternId, isPublished: true };
  if (['easy', 'medium', 'hard'].includes(q.difficulty)) filter.difficulty = q.difficulty;
  if (typeof q.subPattern === 'string' && q.subPattern) filter.subPattern = q.subPattern.slice(0, 80);

  const limit = 40;
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const [rows, total, pattern] = await Promise.all([
    AptitudeQuestion.find(filter).sort({ order: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).select('questionText difficulty subPattern').lean(),
    AptitudeQuestion.countDocuments(filter),
    AptitudePattern.findById(room.patternId).select('subPatterns').lean(),
  ]);

  res.json({
    success: true,
    data: {
      items: rows.map((r, i) => ({
        id: String(r._id),
        n: (page - 1) * limit + i + 1,
        text: r.questionText.replace(/\s+/g, ' ').slice(0, 140),
        difficulty: r.difficulty,
        subPattern: r.subPattern,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      subPatterns: pattern?.subPatterns || [],
    },
  });
}));

router.get('/:id', (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ success: false, message: 'Room not found or expired' });
  res.json({
    success: true,
    data: { id: room.id, kind: room.kind, language: room.language, problemSlug: room.problemSlug, title: room.title, peers: room.peers.size, full: room.peers.size >= MAX_PEERS },
  });
});

export default router;
