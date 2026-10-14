import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Badge, Box, Button, ButtonBase, Chip, CircularProgress, Divider, Drawer, IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Paper, Select, Stack, Tooltip, Typography, alpha, useMediaQuery, useTheme,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { roomApi } from '../../api/roomApi';
import { extractErrorMessage } from '../../api/apiClient';
import QuestionStimulus from '../aptitude/components/QuestionStimulus';
import { DIFFICULTY } from '../aptitude/components/aptitudeUi';
import FloatingCall from './FloatingCall';
import ChatPanel from './ChatPanel';

const MONO = '"JetBrains Mono", monospace';
const LETTERS = ['A', 'B', 'C', 'D'];
const STATE_COLOR = { correct: 'success', wrong: 'error', selected: 'primary' };

function OptionRow({ index, text, state, who, disabled, onClick }) {
  const key = STATE_COLOR[state];
  return (
    <Paper
      component={ButtonBase}
      variant="outlined"
      disabled={disabled}
      onClick={onClick}
      sx={{
        width: '100%',
        p: 1.5,
        borderRadius: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'left',
        borderWidth: key ? 2 : 1,
        borderColor: key ? `${key}.main` : 'divider',
        bgcolor: key ? (t) => alpha(t.palette[key].main, 0.08) : 'transparent',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: 13,
          fontWeight: 800,
          fontFamily: MONO,
          color: key ? '#fff' : 'text.secondary',
          bgcolor: key ? `${key}.main` : 'action.hover',
        }}
      >
        {LETTERS[index]}
      </Box>
      <Typography sx={{ flex: 1, minWidth: 0, whiteSpace: 'pre-line' }}>{text}</Typography>
      {who.length > 0 && (
        <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {who.map((n) => (
            <Chip key={n} size="small" label={n} sx={{ height: 20, fontSize: 11, fontWeight: 700, maxWidth: 90 }} />
          ))}
        </Stack>
      )}
      {state === 'correct' && <CheckCircleRoundedIcon color="success" sx={{ flexShrink: 0 }} />}
    </Paper>
  );
}

// Study room for aptitude: both people see the same question, answer on their own,
// then reveal together. Answers stay hidden from the friend until someone reveals.
export default function AptitudeRoom({ room, call, roomId, copyLink, leave }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { quiz, myChoice, me, peers } = room;
  const friend = peers[0];

  const q = quiz?.question || null;
  const revealed = !!quiz?.revealed;
  const joined = room.status === 'joined';
  const myAnswered = myChoice !== null || !!quiz?.answered?.some((a) => a.key === me?.key);
  const friendAnswered = !!quiz?.answered?.some((a) => a.key !== me?.key);

  const [chatOpen, setChatOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // chat badge: friend's messages that arrived while the chat was closed
  useEffect(() => {
    if (chatOpen) setSeen(room.chat.length);
  }, [chatOpen, room.chat.length]);
  const unread = chatOpen ? 0 : room.chat.filter((m, i) => i >= seen && m.from !== me?.id).length;

  // --- question list (the room's pattern) ---
  const [difficulty, setDifficulty] = useState('');
  const [subPattern, setSubPattern] = useState('');
  const [list, setList] = useState({ items: [], page: 0, pages: 1, total: 0, subPatterns: [] });
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);

  const fetchPage = useCallback(
    async (page) => {
      const { data } = await roomApi.questions(roomId, { page, difficulty: difficulty || undefined, subPattern: subPattern || undefined });
      return data.data;
    },
    [roomId, difficulty, subPattern]
  );

  useEffect(() => {
    let off = false;
    setLoadingList(true);
    setListError(null);
    fetchPage(1)
      .then((d) => !off && setList(d))
      .catch((e) => !off && setListError(extractErrorMessage(e)))
      .finally(() => !off && setLoadingList(false));
    return () => {
      off = true;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingList(true);
    try {
      const d = await fetchPage(list.page + 1);
      setList((prev) => ({ ...d, items: [...prev.items, ...d.items] }));
    } catch (e) {
      setListError(extractErrorMessage(e));
    } finally {
      setLoadingList(false);
    }
  };

  const pick = (id) => {
    room.quizPick(id);
    setPickerOpen(false);
  };

  const next = async () => {
    const idx = list.items.findIndex((i) => i.id === q?._id);
    if (idx < 0) {
      if (list.items[0]) room.quizPick(list.items[0].id);
    } else if (idx < list.items.length - 1) {
      room.quizPick(list.items[idx + 1].id);
    } else if (list.page < list.pages) {
      try {
        const d = await fetchPage(list.page + 1);
        setList((prev) => ({ ...d, items: [...prev.items, ...d.items] }));
        if (d.items[0]) room.quizPick(d.items[0].id);
      } catch (e) {
        setListError(extractErrorMessage(e));
      }
    } else if (list.items[0]) {
      room.quizPick(list.items[0].id);
    }
  };

  const current = list.items.find((i) => i.id === q?._id);
  const topicTitle = list.subPatterns.find((s) => s.slug === q?.subPattern)?.title;
  const diffMeta = q ? DIFFICULTY[q.difficulty] : null;

  const optionState = (i) => {
    if (revealed) return i === quiz.correct ? 'correct' : i === myChoice ? 'wrong' : 'idle';
    return i === myChoice ? 'selected' : 'idle';
  };
  const whoPicked = (i) =>
    revealed ? (quiz.choices || []).filter((c) => c.choice === i).map((c) => (c.key === me?.key ? 'You' : c.name)) : [];

  const myResult = revealed ? (quiz.choices || []).find((c) => c.key === me?.key) : null;
  const sorted = [...(quiz?.tally || [])].sort((a, b) => (a.key === me?.key ? -1 : b.key === me?.key ? 1 : 0));

  const statusLine = !friend
    ? 'Invite a friend — copy the link from the ⋮ menu.'
    : friendAnswered
      ? `${friend.name} answered ✓`
      : `Waiting for ${friend.name}…`;

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* top bar */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, pl: { xs: 2, md: 2.5 }, pr: { xs: 0.75, md: 1.5 }, pt: 'env(safe-area-inset-top)', minHeight: 56, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {room.meta.title || 'Aptitude study room'}
          </Typography>
          <Chip size="small" label={`#${roomId}`} sx={{ display: { xs: 'none', md: 'inline-flex' } }} />
          {room.status === 'reconnecting' && <Chip size="small" color="warning" label="Reconnecting…" />}
        </Box>

        <Tooltip title={friend ? `${friend.name} is here` : 'Waiting for friend'}>
          <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
            {friend ? (
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
                sx={{ '& .MuiBadge-badge': { width: 11, height: 11, borderRadius: '50%', border: '2px solid', borderColor: 'background.paper', boxSizing: 'content-box' } }}
              >
                <Avatar sx={{ width: 30, height: 30, fontSize: '0.85rem', fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  {friend.name?.[0]?.toUpperCase()}
                </Avatar>
              </Badge>
            ) : (
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'action.hover', color: 'text.secondary' }}>
                <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}
          </Box>
        </Tooltip>

        {!call.localStream && (
          <Tooltip title="Start video call">
            <IconButton aria-label="Start video call" onClick={call.start}>
              <VideocamRoundedIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Chat">
          <IconButton aria-label="Open chat" onClick={() => setChatOpen(true)}>
            <Badge badgeContent={unread} color="primary" max={9}>
              <ChatBubbleOutlineRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton aria-label="More options" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertRoundedIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => { setMenuAnchor(null); copyLink(); }}>
            <ListItemIcon><LinkRoundedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Invite link" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { setMenuAnchor(null); leave(); }}>
            <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Leave room" />
          </MenuItem>
        </Menu>
      </Stack>

      {/* running score for this room */}
      {sorted.length > 0 && (
        <Stack direction="row" useFlexGap spacing={1} sx={{ px: 2, py: 0.75, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          {sorted.map((t) => (
            <Chip key={t.key} size="small" variant="outlined" label={`${t.key === me?.key ? 'You' : t.name} ${t.correct}/${t.total}`} sx={{ fontWeight: 700, fontFamily: MONO }} />
          ))}
        </Stack>
      )}

      {/* question */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 1.5, md: 3 } }}>
          {!q ? (
            <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: { xs: 6, md: 10 } }}>
              <Box sx={{ width: 64, height: 64, borderRadius: 4, display: 'grid', placeItems: 'center', bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main' }}>
                <QuizRoundedIcon sx={{ fontSize: 34 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Pick a question to start
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
                Both of you see the same question live. Answer on your own, then reveal together and talk it through.
              </Typography>
              <Button variant="contained" disableElevation startIcon={<FormatListBulletedRoundedIcon />} onClick={() => setPickerOpen(true)} disabled={!joined}>
                Pick a question
              </Button>
              <Typography variant="caption" color="text.secondary">{statusLine}</Typography>
            </Stack>
          ) : (
            <>
              <Stack direction="row" useFlexGap spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
                {current && <Chip size="small" label={`Q${current.n}`} sx={{ fontWeight: 800, fontFamily: MONO }} />}
                {diffMeta && <Chip size="small" label={diffMeta.label} sx={{ fontWeight: 700, color: diffMeta.color, bgcolor: alpha(diffMeta.color, 0.14) }} />}
                {topicTitle && <Chip size="small" variant="outlined" label={topicTitle} />}
              </Stack>

              <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
                <QuestionStimulus set={quiz.set} />
                <Typography sx={{ fontWeight: 600, fontSize: 18, lineHeight: 1.65, mb: 2.5, whiteSpace: 'pre-line' }}>{q.questionText}</Typography>
                <Stack spacing={1.25}>
                  {q.options.map((o, i) => (
                    <OptionRow key={i} index={i} text={o.text} state={optionState(i)} who={whoPicked(i)} disabled={revealed || !joined} onClick={() => room.quizAnswer(i)} />
                  ))}
                </Stack>
                {!revealed && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    {myAnswered ? 'Your answer is locked in (you can still change it). ' : 'Choose your answer. '}
                    {statusLine}
                  </Typography>
                )}
              </Paper>

              {revealed && (
                <Stack spacing={2} sx={{ mt: 2.5 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderColor: myResult ? (myResult.choice === quiz.correct ? 'success.main' : 'error.main') : 'divider',
                      bgcolor: myResult ? (t) => alpha(myResult.choice === quiz.correct ? t.palette.success.main : t.palette.error.main, 0.07) : 'transparent',
                    }}
                  >
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      {myResult && (myResult.choice === quiz.correct ? <CheckCircleRoundedIcon color="success" /> : <CancelRoundedIcon color="error" />)}
                      <Typography sx={{ fontWeight: 800 }}>
                        {myResult ? (myResult.choice === quiz.correct ? 'You got it' : 'Not this time') : 'You skipped this one'} · Answer {LETTERS[quiz.correct]}
                      </Typography>
                    </Stack>
                  </Paper>

                  {quiz.explanation && (
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em' }}>
                        SOLUTION
                      </Typography>
                      <Typography sx={{ mt: 0.75, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{quiz.explanation}</Typography>
                    </Paper>
                  )}

                  {quiz.shortcut && (
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: (t) => alpha(t.palette.warning.main, 0.07), borderColor: (t) => alpha(t.palette.warning.main, 0.5) }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <BoltRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main', letterSpacing: '0.1em' }}>
                          EXAM SHORTCUT
                        </Typography>
                      </Stack>
                      <Typography sx={{ mt: 0.75, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{quiz.shortcut}</Typography>
                    </Paper>
                  )}
                </Stack>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* actions */}
      {q && (
        <Stack direction="row" spacing={1} sx={{ p: 1.25, pb: 'calc(10px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 720 }}>
            <Button variant="outlined" startIcon={<FormatListBulletedRoundedIcon />} onClick={() => setPickerOpen(true)} sx={{ flexShrink: 0 }}>
              Questions
            </Button>
            {revealed ? (
              <Button fullWidth variant="contained" disableElevation endIcon={<ArrowForwardRoundedIcon />} onClick={next} disabled={!joined}>
                Next question
              </Button>
            ) : (
              <Button fullWidth variant={myAnswered && friendAnswered ? 'contained' : 'outlined'} disableElevation onClick={room.quizReveal} disabled={!joined}>
                {myAnswered && friendAnswered ? 'Both answered — show answer' : 'Show answer'}
              </Button>
            )}
          </Box>
        </Stack>
      )}

      {/* question picker */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : 420,
              height: isMobile ? '85dvh' : '100%',
              borderRadius: isMobile ? '24px 24px 0 0' : 0,
              display: 'flex',
              flexDirection: 'column',
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ flex: 1, fontWeight: 700 }}>Pick a question{list.total ? ` · ${list.total}` : ''}</Typography>
          <IconButton size="small" aria-label="Close" onClick={() => setPickerOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1} sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" useFlexGap spacing={0.75} sx={{ flexWrap: 'wrap' }}>
            {[['', 'All'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']].map(([v, label]) => (
              <Chip key={label} size="small" label={label} color={difficulty === v ? 'primary' : 'default'} variant={difficulty === v ? 'filled' : 'outlined'} onClick={() => setDifficulty(v)} sx={{ fontWeight: 700 }} />
            ))}
          </Stack>
          {list.subPatterns.length > 0 && (
            <Select size="small" displayEmpty fullWidth value={subPattern} onChange={(e) => setSubPattern(e.target.value)} sx={{ fontSize: 14 }}>
              <MenuItem value="">All topics</MenuItem>
              {list.subPatterns.map((s) => (
                <MenuItem key={s.slug} value={s.slug}>{s.title}</MenuItem>
              ))}
            </Select>
          )}
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {listError && <Alert severity="error" sx={{ m: 1.5 }}>{listError}</Alert>}
          {!loadingList && !listError && list.items.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>No questions for this filter.</Typography>
          )}
          {list.items.map((it) => {
            const dm = DIFFICULTY[it.difficulty];
            const active = it.id === q?._id;
            return (
              <ButtonBase
                key={it.id}
                onClick={() => pick(it.id)}
                sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 1.25, textAlign: 'left', px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.1) : 'transparent', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: MONO, color: 'text.secondary', minWidth: 28 }}>{it.n}</Typography>
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.text}</Typography>
                {dm && <Chip size="small" label={dm.label} sx={{ height: 20, fontSize: 11, fontWeight: 700, color: dm.color, bgcolor: alpha(dm.color, 0.14) }} />}
              </ButtonBase>
            );
          })}
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            {loadingList ? (
              <CircularProgress size={22} />
            ) : (
              list.page < list.pages && (
                <Button size="small" onClick={loadMore}>
                  Load more ({list.items.length}/{list.total})
                </Button>
              )
            )}
          </Box>
        </Box>
      </Drawer>

      {/* chat */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : 360,
              height: isMobile ? '70dvh' : '100%',
              borderRadius: isMobile ? '24px 24px 0 0' : 0,
              display: 'flex',
              flexDirection: 'column',
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ flex: 1, fontWeight: 700 }}>Chat{friend ? ` · ${friend.name}` : ''}</Typography>
          <IconButton size="small" aria-label="Close chat" onClick={() => setChatOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <ChatPanel messages={room.chat} myId={me?.id} onSend={room.sendChat} disabled={!joined} />
      </Drawer>

      <FloatingCall call={call} friendName={friend?.name} myName={me?.name} hasFriend={!!friend} />
    </Box>
  );
}
