import mongoose from 'mongoose';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeSet } from '../models/AptitudeSet.js';

// Aptitude study-room state. Lives on room.quiz (in memory, like the rest of the room).
// The answer key stays on the server in quiz.secret and only goes out on reveal, same
// "never ship the answer before it is graded" rule as the normal practice API.

/** Load a question of the room's pattern and make it the current one. Returns false if not found. */
export async function pickQuestion(room, questionId) {
  if (!mongoose.isValidObjectId(questionId)) return false;
  const q = await AptitudeQuestion.findOne({ _id: questionId, pattern: room.patternId, isPublished: true }).lean();
  if (!q) return false;
  const set = q.setId
    ? await AptitudeSet.findOne({ pattern: room.patternId, setId: q.setId }).select('-__v -createdAt -updatedAt -pattern').lean()
    : null;

  room.quiz = {
    seq: (room.quiz?.seq || 0) + 1,
    question: {
      _id: String(q._id),
      questionText: q.questionText,
      options: q.options.map((o) => ({ text: o.text })),
      difficulty: q.difficulty,
      subPattern: q.subPattern,
    },
    set,
    secret: { correct: q.correctOptionIndex, explanation: q.explanation || '', shortcut: q.shortcut || '' },
    answers: new Map(), // peer key -> { name, choice }
    revealed: false,
  };
  return true;
}

export function setAnswer(room, key, name, choice) {
  const qz = room.quiz;
  if (!qz || qz.revealed || !Number.isInteger(choice) || choice < 0 || choice > 3) return false;
  qz.answers.set(key, { name, choice });
  return true;
}

/** Reveal the answer to everyone and update the room's running score. */
export function revealQuestion(room) {
  const qz = room.quiz;
  if (!qz || qz.revealed) return false;
  qz.revealed = true;
  for (const [key, a] of qz.answers) {
    const t = room.tally.get(key) || { name: a.name, correct: 0, total: 0 };
    t.name = a.name;
    t.total += 1;
    if (a.choice === qz.secret.correct) t.correct += 1;
    room.tally.set(key, t);
  }
  return true;
}

/** What clients may see. Who answered, but not what, until the reveal. */
export function quizView(room) {
  const tally = [...room.tally].map(([key, t]) => ({ key, ...t }));
  const qz = room.quiz;
  if (!qz) return { question: null, tally };

  const view = {
    seq: qz.seq,
    question: qz.question,
    set: qz.set,
    revealed: qz.revealed,
    answered: [...qz.answers].map(([key, a]) => ({ key, name: a.name })),
    tally,
  };
  if (qz.revealed) {
    view.correct = qz.secret.correct;
    view.explanation = qz.secret.explanation;
    view.shortcut = qz.secret.shortcut;
    view.choices = [...qz.answers].map(([key, a]) => ({ key, name: a.name, choice: a.choice }));
  }
  return view;
}
