import { lazy, Suspense, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ButtonBase, Drawer, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import { tint } from '../dashboard/dashboardUtils';
import { RARITY_COLOR, formatDate, goalMilestone, levelInfo } from './questUtils';

// Phone layout of Quests. It follows the phone Contest, Store and Leaderboard pages: same page padding, 44px icon
// buttons, centred header, 1.25rem section titles, rounded panels, pill buttons and bottom sheets with a close arrow.
// Three blocks on one screen: your level and today's check-in, the check-in rewards, and your butterfly.
// Missions and diamond top-up live in sheets behind two icons. The 3D road map is replaced by a plain reward list.
// The server decides every result (progress, claims, upgrades); this screen only shows what it returns.

const ACCENT = '#6366F1';
const GREEN = '#16A34A';
const ORANGE = '#F97316';
const DIAMOND = '#0EA5E9';
const COIN = '#D97706';

const ButterflyShowcase = lazy(() => import('./ButterflyShowcase'));

const solidBtn = { height: 48, borderRadius: 999, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } };
const tintBtn = { ...solidBtn, bgcolor: tint(ACCENT, 20), color: ACCENT, '&:hover': { bgcolor: tint(ACCENT, 30) } };
const smallBtn = { height: 40, px: 2, borderRadius: 999, fontWeight: 800, fontSize: '0.9rem', textTransform: 'none', flexShrink: 0 };

function SectionTitle({ children, id, aside }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography id={id} component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
        {children}
      </Typography>
      {aside}
    </Stack>
  );
}

function Meter({ pct, color = ACCENT, height = 8 }) {
  return (
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, pct))}
      sx={{ height, borderRadius: 999, bgcolor: tint(color, 18), '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: color } }}
    />
  );
}

function SheetHead({ title, onClose, label }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <IconButton onClick={onClose} aria-label={label} sx={{ width: 44, height: 44 }}>
        <KeyboardArrowDownRoundedIcon />
      </IconButton>
      <Typography component="h2" sx={{ flex: 1, fontWeight: 800, fontSize: '1.05rem' }}>
        {title}
      </Typography>
    </Stack>
  );
}

const sheetPaper = { sx: { borderRadius: '26px 26px 0 0', maxHeight: '90dvh', backgroundImage: 'none' } };
const sheetBody = { px: 1.75, pt: 1, pb: 'calc(16px + env(safe-area-inset-bottom))' };

// ---------------------------------------------------------------- sheets
function MissionsSheet({ open, onClose, quests, busy, onClaim, onSolve }) {
  const sorted = [...quests].sort((a, b) => Number(b.claimable) - Number(a.claimable) || Number(a.claimed) - Number(b.claimed) || b.value / b.target - a.value / a.target);
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: sheetPaper }}>
      <Box sx={{ ...sheetBody, overflowY: 'auto' }}>
        <SheetHead title="Missions" onClose={onClose} label="Close missions" />
        <Box sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          {sorted.map((q) => (
            <Stack key={q.id} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', opacity: q.claimed ? 0.55 : 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.98rem' }}>{q.title}</Typography>
                <Box sx={{ my: 0.75 }}><Meter pct={(q.value / q.target) * 100} color={q.claimable || q.claimed ? GREEN : ACCENT} height={6} /></Box>
                <Typography color="text.secondary" noWrap sx={{ fontSize: '0.82rem' }}>{q.value}/{q.target} · +{q.xp} XP · {q.reward.label}</Typography>
              </Box>
              {q.claimed ? (
                <CheckRoundedIcon aria-label="Claimed" sx={{ color: GREEN }} />
              ) : q.claimable ? (
                <Button disableElevation variant="contained" disabled={busy === q.id} onClick={() => onClaim(q)} sx={{ ...smallBtn, bgcolor: GREEN, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${GREEN} 85%, #000)` } }}>Claim</Button>
              ) : (
                <Button disableElevation variant="contained" onClick={() => onSolve(q.difficulty)} sx={{ ...smallBtn, bgcolor: tint(ACCENT, 20), color: ACCENT, '&:hover': { bgcolor: tint(ACCENT, 30) } }}>Go</Button>
              )}
            </Stack>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
}

function WalletSheet({ topUp, onClose, coins, diamonds, rate, busy, onConvert }) {
  const max = Math.max(0, Math.floor(coins / rate));
  const [n, setN] = useState(1);
  useEffect(() => {
    if (topUp.open) setN(Math.min(Math.max(topUp.want || 1, 1), Math.max(max, 1)));
  }, [topUp.open, topUp.want, max]);
  const can = n >= 1 && n <= max;
  const step = { width: 44, height: 44, border: '1px solid', borderColor: 'divider' };

  return (
    <Drawer anchor="bottom" open={topUp.open} onClose={onClose} slotProps={{ paper: sheetPaper }}>
      <Box sx={sheetBody}>
        <SheetHead title="Diamonds" onClose={onClose} label="Close diamonds" />
        <Stack direction="row" sx={{ mt: 1, gap: 1 }}>
          {[[<MonetizationOnRoundedIcon key="c" sx={{ color: COIN }} />, coins, 'coins', COIN], [<DiamondRoundedIcon key="d" sx={{ color: DIAMOND }} />, diamonds, 'diamonds', DIAMOND]].map(([icon, v, label, c]) => (
            <Stack key={label} direction="row" sx={{ flex: 1, alignItems: 'center', gap: 1, p: 1.25, borderRadius: '20px', bgcolor: tint(c, 12) }}>
              {icon}
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{v.toLocaleString('en-IN')}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>{label}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 3, my: 2.5 }}>
          <IconButton aria-label="Fewer diamonds" disabled={n <= 1} onClick={() => setN((v) => Math.max(1, v - 1))} sx={step}><RemoveRoundedIcon /></IconButton>
          <Box sx={{ minWidth: 88, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '2.4rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>diamonds</Typography>
          </Box>
          <IconButton aria-label="More diamonds" disabled={n >= max} onClick={() => setN((v) => Math.min(Math.max(max, 1), v + 1))} sx={step}><AddRoundedIcon /></IconButton>
        </Stack>

        <Stack direction="row" sx={{ gap: 1, justifyContent: 'center' }}>
          {[1, 5, 10].map((v) => (
            <ButtonBase key={v} disabled={v > max} onClick={() => setN(v)} sx={{ height: 36, px: 2, borderRadius: 999, fontWeight: 700, bgcolor: n === v ? tint(ACCENT, 20) : tint('#64748B', 14), color: n === v ? ACCENT : 'text.primary', '&.Mui-disabled': { opacity: 0.45 } }}>{v}</ButtonBase>
          ))}
          <ButtonBase disabled={max < 1} onClick={() => setN(Math.max(max, 1))} sx={{ height: 36, px: 2, borderRadius: 999, fontWeight: 700, bgcolor: tint('#64748B', 14), '&.Mui-disabled': { opacity: 0.45 } }}>Max</ButtonBase>
        </Stack>

        <Typography sx={{ mt: 2, textAlign: 'center', fontWeight: 700, color: can ? 'text.primary' : 'error.main' }}>
          {can ? `${(n * rate).toLocaleString('en-IN')} coins = ${n} diamond${n > 1 ? 's' : ''}` : `You need ${rate} coins for 1 diamond`}
        </Typography>
        <Typography color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.82rem', mt: 0.25 }}>{rate} coins = 1 diamond</Typography>

        <Button fullWidth disableElevation variant="contained" disabled={!can || busy} onClick={() => onConvert(n)} sx={{ ...solidBtn, mt: 2.5 }}>
          {busy ? 'Converting…' : 'Convert'}
        </Button>
        <Button fullWidth component={RouterLink} to="/store" sx={{ ...tintBtn, mt: 1, bgcolor: 'transparent', '&:hover': { bgcolor: tint(ACCENT, 10) } }}>
          Open store
        </Button>
      </Box>
    </Drawer>
  );
}

function RewardSheet({ reward, onClose }) {
  const pro = reward?.reward?.type === 'pro';
  return (
    <Drawer anchor="bottom" open={Boolean(reward)} onClose={onClose} slotProps={{ paper: sheetPaper }}>
      {reward && (
        <Box sx={{ ...sheetBody, textAlign: 'center' }}>
          <SheetHead title="Reward" onClose={onClose} label="Close reward" />
          <Box sx={{ mx: 'auto', mt: 1.5, width: 88, height: 88, borderRadius: '28px', display: 'grid', placeItems: 'center', bgcolor: tint(pro ? COIN : DIAMOND, 16) }}>
            <DiamondRoundedIcon sx={{ fontSize: 48, color: pro ? COIN : DIAMOND }} />
          </Box>
          <Typography component="p" sx={{ mt: 2, fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.15 }}>{reward.reward.label}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>{pro && reward.proUntil ? `Pro active until ${formatDate(reward.proUntil)}` : 'Added to your profile'}</Typography>
          <Stack direction="row" sx={{ mt: 2, justifyContent: 'center', gap: 2, fontWeight: 800 }}>
            <Box sx={{ color: ACCENT }}>+{reward.xp} XP</Box>
            {reward.coins > 0 && <Box sx={{ color: COIN }}>+{reward.coins} coins</Box>}
          </Stack>
          <Button fullWidth disableElevation variant="contained" onClick={onClose} sx={{ ...solidBtn, mt: 3 }}>Done</Button>
        </Box>
      )}
    </Drawer>
  );
}

// ---------------------------------------------------------------- page
export default function MobileQuests({ state, isAuthenticated, coins, diamonds, busy, converting, reward, topUp, dark, reduce, flyApi, onClaim, onUpgrade, onSolve, onLogin, onConvert, onTopUp, onCloseTopUp, onCloseReward }) {
  const [missions, setMissions] = useState(false);
  const [flyFailed, setFlyFailed] = useState(false);

  const goal = goalMilestone(state.milestones);
  const info = levelInfo(state.xp);
  const { butterfly } = state;
  const ready = state.quests.filter((q) => q.claimable).length;
  const rarity = RARITY_COLOR[butterfly.current.rarity] || '#8E99AD';
  const short = butterfly.next ? Math.max(0, butterfly.next.cost - diamonds) : 0;
  const rewards = [...state.milestones].sort((a, b) => a.target - b.target);

  return (
    <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* header: back, title, missions and diamonds */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ width: 44, height: 44 }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography component="h1" sx={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1.05rem' }}>Quests</Typography>
        <IconButton onClick={() => setMissions(true)} aria-label={ready ? `Missions, ${ready} ready to claim` : 'Missions'} sx={{ width: 44, height: 44, position: 'relative' }}>
          <AssignmentRoundedIcon />
          {ready > 0 && (
            <Box component="span" sx={{ position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, px: 0.5, display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff', bgcolor: ORANGE, borderRadius: 9 }}>{ready}</Box>
          )}
        </IconButton>
        <IconButton onClick={() => (isAuthenticated ? onTopUp(1) : onLogin())} aria-label="Diamonds and top up" sx={{ width: 44, height: 44 }}>
          <DiamondRoundedIcon sx={{ color: DIAMOND }} />
        </IconButton>
      </Stack>

      {/* level and today's check-in */}
      <Box
        component="section"
        aria-label="Your level"
        sx={(t) => ({ mt: 1, borderRadius: '26px', p: 1.75, background: `linear-gradient(160deg, ${tint(ACCENT, t.palette.mode === 'dark' ? 20 : 14)} 0%, ${tint(ACCENT, 4)} 62%, transparent 100%)`, border: `1px solid ${tint(ACCENT, 24)}` })}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '16px', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 800, fontSize: '1.25rem', color: '#fff', bgcolor: ACCENT }}>{info.level}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>{info.rank}</Typography>
            <Typography color="text.secondary" noWrap sx={{ fontSize: '0.82rem' }}>{info.max ? 'Top level' : `${info.toNext} XP to level ${info.level + 1}`}</Typography>
          </Box>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, color: ORANGE }} aria-label={`${state.streakDays} day streak`}>
            <LocalFireDepartmentRoundedIcon />
            <Typography sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{state.streakDays}</Typography>
          </Stack>
        </Stack>
        <Box sx={{ mt: 1.5 }}><Meter pct={info.pct} /></Box>

        {!isAuthenticated ? (
          <Button fullWidth disableElevation variant="contained" onClick={onLogin} sx={{ ...solidBtn, mt: 1.75 }}>Log in to start</Button>
        ) : state.checkedInToday ? (
          <Button fullWidth disabled disableElevation variant="contained" startIcon={<CheckRoundedIcon />} sx={{ ...tintBtn, mt: 1.75, '&.Mui-disabled': { color: GREEN, bgcolor: tint(GREEN, 16) } }}>Checked in today</Button>
        ) : (
          <Button fullWidth disableElevation variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={() => onSolve(null)} sx={{ ...solidBtn, mt: 1.75 }}>Solve today&apos;s problem</Button>
        )}
      </Box>

      {/* check-in rewards */}
      <Box component="section" aria-labelledby="quest-rewards" sx={{ mt: 3 }}>
        <SectionTitle id="quest-rewards" aside={<Typography color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{state.activeDays} / {goal.target} check-ins</Typography>}>
          Rewards
        </SectionTitle>
        <Box sx={{ mb: 1 }}><Meter pct={(state.activeDays / goal.target) * 100} /></Box>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          {rewards.map((m) => {
            const pro = m.reward.type === 'pro';
            const c = pro ? COIN : DIAMOND;
            return (
              <Stack key={m.id} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', opacity: m.claimed ? 0.55 : 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: tint(c, 16) }}>
                  <DiamondRoundedIcon sx={{ fontSize: 22, color: c }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.98rem' }}>{m.reward.label}</Typography>
                  <Typography color="text.secondary" noWrap sx={{ fontSize: '0.82rem' }}>Day {m.target}</Typography>
                </Box>
                {m.claimed ? (
                  <CheckRoundedIcon aria-label="Claimed" sx={{ color: GREEN }} />
                ) : m.claimable ? (
                  <Button disableElevation variant="contained" disabled={busy === m.id} onClick={() => onClaim(m)} sx={{ ...smallBtn, bgcolor: GREEN, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${GREEN} 85%, #000)` } }}>Claim</Button>
                ) : (
                  <LockRoundedIcon aria-label="Locked" sx={{ fontSize: 20, color: 'text.disabled' }} />
                )}
              </Stack>
            );
          })}
        </Box>
      </Box>

      {/* butterfly */}
      <Box component="section" aria-labelledby="quest-butterfly" sx={{ mt: 3 }}>
        <SectionTitle id="quest-butterfly" aside={<Typography color="text.secondary" sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Level {butterfly.level} / {butterfly.max}</Typography>}>
          My butterfly
        </SectionTitle>
        <Box sx={{ borderRadius: '26px', p: 1.75, border: `1px solid ${tint(rarity, 30)}`, background: `linear-gradient(160deg, ${tint(rarity, dark ? 18 : 12)} 0%, transparent 70%)` }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography component="h3" noWrap sx={{ flex: 1, fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{butterfly.current.name}</Typography>
            <Typography component="span" sx={{ px: 1, py: 0.4, borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.2, color: dark ? rarity : `color-mix(in srgb, ${rarity} 70%, #000)`, bgcolor: tint(rarity, 18) }}>{butterfly.current.rarity}</Typography>
          </Stack>
          <Box sx={{ position: 'relative', height: 220, my: 0.5 }}>
            {flyFailed ? null : (
              <Suspense fallback={null}>
                <ButterflyShowcase styleId={butterfly.current.id} dark={dark} reduce={reduce} onFail={() => setFlyFailed(true)} apiRef={flyApi} />
              </Suspense>
            )}
          </Box>
          <Stack direction="row" sx={{ gap: 0.5, mb: 1.5 }} aria-hidden>
            {butterfly.tiers.map((id, i) => (
              <Box key={id} sx={{ flex: 1, height: 6, borderRadius: 999, bgcolor: i < butterfly.level ? ACCENT : tint(ACCENT, 18) }} />
            ))}
          </Stack>
          {butterfly.next ? (
            <>
              <Button
                fullWidth
                disableElevation
                variant="contained"
                disabled={busy === 'upgrade'}
                onClick={onUpgrade}
                startIcon={<ArrowUpwardRoundedIcon />}
                endIcon={<Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 0.25, px: 1, py: 0.25, borderRadius: 999, bgcolor: 'rgba(0,0,0,0.25)' }}><DiamondRoundedIcon sx={{ fontSize: 16 }} />{butterfly.next.cost}</Stack>}
                sx={short > 0 ? { ...tintBtn } : solidBtn}
              >
                {busy === 'upgrade' ? 'Upgrading…' : `Upgrade to ${butterfly.next.name}`}
              </Button>
              <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center', fontSize: '0.82rem' }}>
                {isAuthenticated ? (short > 0 ? `Need ${short} more diamond${short > 1 ? 's' : ''}. Tap to top up.` : `You have ${diamonds} diamonds`) : 'Log in to upgrade'}
              </Typography>
            </>
          ) : (
            <Typography sx={{ textAlign: 'center', fontWeight: 800, color: COIN }}>Max level</Typography>
          )}
        </Box>
      </Box>

      <MissionsSheet open={missions} onClose={() => setMissions(false)} quests={state.quests} busy={busy} onClaim={onClaim} onSolve={(d) => { setMissions(false); onSolve(d); }} />
      <WalletSheet topUp={topUp} onClose={onCloseTopUp} coins={coins} diamonds={diamonds} rate={state.coinsPerDiamond} busy={converting} onConvert={onConvert} />
      <RewardSheet reward={reward} onClose={onCloseReward} />
    </Box>
  );
}
