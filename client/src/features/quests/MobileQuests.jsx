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
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  libBackBtnSx,
  libIconBtnSx,
  libSectionTitleSx,
  libSolidBtnSx,
  libTintBtnSx,
  useLibraryPalette,
} from '../dashboard/components/libraryStyle';
import { RARITY_COLOR, formatDate, goalMilestone, levelInfo } from './questUtils';

// Phone layout of Quests in the Library look (same as the phone Problems, Home and You pages): Roboto type, warm
// surface, 16px page padding, 40px icon buttons, 18px section titles, cream panels, pill buttons and bottom sheets.
// Three blocks on one screen: your level and today's check-in, the check-in rewards, and your butterfly.
// Missions and diamond top-up live in sheets behind two icons. The 3D road map is replaced by a plain reward list.
// The server decides every result (progress, claims, upgrades); this screen only shows what it returns.

const ACCENT = LIB_ACCENT;
const GREEN = '#16A34A';
const ORANGE = '#F97316';
const DIAMOND = '#0EA5E9';
const COIN = '#D97706';

const ButterflyShowcase = lazy(() => import('./ButterflyShowcase'));

const solidBtn = libSolidBtnSx;
const tintBtn = libTintBtnSx;
const smallBtn = { height: 36, px: 2, borderRadius: 999, fontWeight: 500, fontSize: 15, letterSpacing: LIB_TRACKING, textTransform: 'none', flexShrink: 0 };

function SectionTitle({ children, id, aside }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography id={id} component="h2" sx={libSectionTitleSx}>
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
      <IconButton onClick={onClose} aria-label={label} sx={{ ...libBackBtnSx }}>
        <KeyboardArrowDownRoundedIcon />
      </IconButton>
      <Typography component="h2" sx={{ flex: 1, ...libSectionTitleSx }}>
        {title}
      </Typography>
    </Stack>
  );
}

const sheetPaper = (pal) => ({ sx: { borderRadius: '26px 26px 0 0', maxHeight: '90dvh', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text } });
const sheetBody = { px: 2, pt: 1, pb: 'calc(16px + env(safe-area-inset-bottom))' };

// ---------------------------------------------------------------- sheets
function MissionsSheet({ open, onClose, quests, busy, onClaim, onSolve }) {
  const pal = useLibraryPalette();
  const sorted = [...quests].sort((a, b) => Number(b.claimable) - Number(a.claimable) || Number(a.claimed) - Number(b.claimed) || b.value / b.target - a.value / a.target);
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: sheetPaper(pal) }}>
      <LibraryFont>
      <Box sx={{ ...sheetBody, overflowY: 'auto' }}>
        <SheetHead title="Missions" onClose={onClose} label="Close missions" />
        <Box sx={{ mt: 1, borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
          {sorted.map((q) => (
            <Stack key={q.id} direction="row" sx={{ alignItems: 'center', gap: '12px', py: 1.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' }, opacity: q.claimed ? 0.55 : 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{q.title}</Typography>
                <Box sx={{ my: 0.75 }}><Meter pct={(q.value / q.target) * 100} color={q.claimable || q.claimed ? GREEN : ACCENT} height={6} /></Box>
                <Typography color="var(--lib-muted)" noWrap sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>{q.value}/{q.target} · +{q.xp} XP · {q.reward.label}</Typography>
              </Box>
              {q.claimed ? (
                <CheckRoundedIcon aria-label="Claimed" sx={{ color: GREEN }} />
              ) : q.claimable ? (
                <Button disableElevation variant="contained" disabled={busy === q.id} onClick={() => onClaim(q)} sx={{ ...smallBtn, bgcolor: GREEN, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${GREEN} 85%, #000)` } }}>Claim</Button>
              ) : (
                <Button disableElevation variant="contained" onClick={() => onSolve(q.difficulty)} sx={{ ...smallBtn, bgcolor: 'var(--lib-player)', color: 'var(--lib-text)', '&:hover': { bgcolor: 'var(--lib-player)', filter: 'brightness(0.97)' } }}>Go</Button>
              )}
            </Stack>
          ))}
        </Box>
      </Box>
      </LibraryFont>
    </Drawer>
  );
}

function WalletSheet({ topUp, onClose, coins, diamonds, rate, busy, onConvert }) {
  const pal = useLibraryPalette();
  const max = Math.max(0, Math.floor(coins / rate));
  const [n, setN] = useState(1);
  useEffect(() => {
    if (topUp.open) setN(Math.min(Math.max(topUp.want || 1, 1), Math.max(max, 1)));
  }, [topUp.open, topUp.want, max]);
  const can = n >= 1 && n <= max;
  const step = { width: 44, height: 44, border: '1px solid', borderColor: 'var(--lib-divider)', color: 'var(--lib-text)' };

  return (
    <Drawer anchor="bottom" open={topUp.open} onClose={onClose} slotProps={{ paper: sheetPaper(pal) }}>
      <LibraryFont>
      <Box sx={sheetBody}>
        <SheetHead title="Diamonds" onClose={onClose} label="Close diamonds" />
        <Stack direction="row" sx={{ mt: 1, gap: 1 }}>
          {[[<MonetizationOnRoundedIcon key="c" sx={{ color: COIN }} />, coins, 'coins', COIN], [<DiamondRoundedIcon key="d" sx={{ color: DIAMOND }} />, diamonds, 'diamonds', DIAMOND]].map(([icon, v, label, c]) => (
            <Stack key={label} direction="row" sx={{ flex: 1, alignItems: 'center', gap: 1, p: 1.25, borderRadius: '16px', bgcolor: tint(c, 12) }}>
              {icon}
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{v.toLocaleString('en-IN')}</Typography>
                <Typography color="var(--lib-muted)" sx={{ fontSize: 14 }}>{label}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 3, my: 2.5 }}>
          <IconButton aria-label="Fewer diamonds" disabled={n <= 1} onClick={() => setN((v) => Math.max(1, v - 1))} sx={step}><RemoveRoundedIcon /></IconButton>
          <Box sx={{ minWidth: 88, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '2.4rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
            <Typography color="var(--lib-muted)" sx={{ fontSize: 14, mt: 0.5 }}>diamonds</Typography>
          </Box>
          <IconButton aria-label="More diamonds" disabled={n >= max} onClick={() => setN((v) => Math.min(Math.max(max, 1), v + 1))} sx={step}><AddRoundedIcon /></IconButton>
        </Stack>

        <Stack direction="row" sx={{ gap: 1, justifyContent: 'center' }}>
          {[1, 5, 10].map((v) => (
            <ButtonBase key={v} disabled={v > max} onClick={() => setN(v)} sx={{ height: 36, px: 2, borderRadius: 999, fontWeight: 700, bgcolor: n === v ? ACCENT : 'var(--lib-chip)', color: n === v ? '#fff' : 'var(--lib-chip-text)', '&.Mui-disabled': { opacity: 0.45 } }}>{v}</ButtonBase>
          ))}
          <ButtonBase disabled={max < 1} onClick={() => setN(Math.max(max, 1))} sx={{ height: 36, px: 2, borderRadius: 999, fontWeight: 700, bgcolor: 'var(--lib-chip)', color: 'var(--lib-chip-text)', '&.Mui-disabled': { opacity: 0.45 } }}>Max</ButtonBase>
        </Stack>

        <Typography sx={{ mt: 2, textAlign: 'center', fontWeight: 700, color: can ? 'text.primary' : 'error.main' }}>
          {can ? `${(n * rate).toLocaleString('en-IN')} coins = ${n} diamond${n > 1 ? 's' : ''}` : `You need ${rate} coins for 1 diamond`}
        </Typography>
        <Typography color="var(--lib-muted)" sx={{ textAlign: 'center', fontSize: 14, mt: 0.25 }}>{rate} coins = 1 diamond</Typography>

        <Button fullWidth disableElevation variant="contained" disabled={!can || busy} onClick={() => onConvert(n)} sx={{ ...solidBtn, mt: 2.5 }}>
          {busy ? 'Converting…' : 'Convert'}
        </Button>
        <Button fullWidth component={RouterLink} to="/store" sx={{ ...tintBtn, mt: 1, color: ACCENT }}>
          Open store
        </Button>
      </Box>
      </LibraryFont>
    </Drawer>
  );
}

function RewardSheet({ reward, onClose }) {
  const pal = useLibraryPalette();
  const pro = reward?.reward?.type === 'pro';
  return (
    <Drawer anchor="bottom" open={Boolean(reward)} onClose={onClose} slotProps={{ paper: sheetPaper(pal) }}>
      {reward && (
        <LibraryFont>
        <Box sx={{ ...sheetBody, textAlign: 'center' }}>
          <SheetHead title="Reward" onClose={onClose} label="Close reward" />
          <Box sx={{ mx: 'auto', mt: 1.5, width: 88, height: 88, borderRadius: '28px', display: 'grid', placeItems: 'center', bgcolor: tint(pro ? COIN : DIAMOND, 16) }}>
            <DiamondRoundedIcon sx={{ fontSize: 48, color: pro ? COIN : DIAMOND }} />
          </Box>
          <Typography component="p" sx={{ mt: 2, fontWeight: 700, fontSize: 24, lineHeight: '30px' }}>{reward.reward.label}</Typography>
          <Typography color="var(--lib-muted)" sx={{ mt: 0.5, fontSize: 16 }}>{pro && reward.proUntil ? `Pro active until ${formatDate(reward.proUntil)}` : 'Added to your profile'}</Typography>
          <Stack direction="row" sx={{ mt: 2, justifyContent: 'center', gap: 2, fontWeight: 800 }}>
            <Box sx={{ color: ACCENT }}>+{reward.xp} XP</Box>
            {reward.coins > 0 && <Box sx={{ color: COIN }}>+{reward.coins} coins</Box>}
          </Stack>
          <Button fullWidth disableElevation variant="contained" onClick={onClose} sx={{ ...solidBtn, mt: 3 }}>Done</Button>
        </Box>
        </LibraryFont>
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
    <LibraryFont>
    <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* header: back, title, missions and diamonds */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography component="h1" sx={{ flex: 1, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>Quests</Typography>
        <IconButton onClick={() => setMissions(true)} aria-label={ready ? `Missions, ${ready} ready to claim` : 'Missions'} sx={{ ...libIconBtnSx, position: 'relative' }}>
          <AssignmentRoundedIcon />
          {ready > 0 && (
            <Box component="span" sx={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, px: 0.5, display: 'grid', placeItems: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff', bgcolor: ORANGE, borderRadius: 9 }}>{ready}</Box>
          )}
        </IconButton>
        <IconButton onClick={() => (isAuthenticated ? onTopUp(1) : onLogin())} aria-label="Diamonds and top up" sx={libIconBtnSx}>
          <DiamondRoundedIcon sx={{ color: DIAMOND }} />
        </IconButton>
      </Stack>

      {/* level and today's check-in */}
      <Box
        component="section"
        aria-label="Your level"
        sx={{ mt: 2, borderRadius: '20px', p: 2, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '16px', display: 'grid', placeItems: 'center', flexShrink: 0, fontWeight: 700, fontSize: 20, color: '#fff', bgcolor: ACCENT }}>{info.level}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{info.rank}</Typography>
            <Typography color="var(--lib-muted)" noWrap sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>{info.max ? 'Top level' : `${info.toNext} XP to level ${info.level + 1}`}</Typography>
          </Box>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, color: ORANGE }} aria-label={`${state.streakDays} day streak`}>
            <LocalFireDepartmentRoundedIcon />
            <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{state.streakDays}</Typography>
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
      <Box component="section" aria-labelledby="quest-rewards" sx={{ mt: 4 }}>
        <SectionTitle id="quest-rewards" aside={<Typography color="var(--lib-muted)" sx={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{state.activeDays} / {goal.target} check-ins</Typography>}>
          Rewards
        </SectionTitle>
        <Box sx={{ mb: 1 }}><Meter pct={(state.activeDays / goal.target) * 100} /></Box>
        <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
          {rewards.map((m) => {
            const pro = m.reward.type === 'pro';
            const c = pro ? COIN : DIAMOND;
            return (
              <Stack key={m.id} direction="row" sx={{ alignItems: 'center', gap: '12px', py: 1.25, borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' }, opacity: m.claimed ? 0.55 : 1 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '14px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: tint(c, 16) }}>
                  <DiamondRoundedIcon sx={{ fontSize: 22, color: c }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{m.reward.label}</Typography>
                  <Typography color="var(--lib-muted)" noWrap sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>Day {m.target}</Typography>
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
      <Box component="section" aria-labelledby="quest-butterfly" sx={{ mt: 4 }}>
        <SectionTitle id="quest-butterfly" aside={<Typography color="var(--lib-muted)" sx={{ fontSize: 14 }}>Level {butterfly.level} / {butterfly.max}</Typography>}>
          My butterfly
        </SectionTitle>
        <Box sx={{ borderRadius: '20px', p: 2, border: `1px solid ${tint(rarity, 30)}`, background: `linear-gradient(160deg, ${tint(rarity, dark ? 18 : 12)} 0%, transparent 70%)` }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography component="h3" noWrap sx={{ flex: 1, fontWeight: 700, fontSize: 20, lineHeight: '28px' }}>{butterfly.current.name}</Typography>
            <Typography component="span" sx={{ px: 1, py: 0.4, borderRadius: '10px', fontSize: 13, fontWeight: 500, lineHeight: 1.2, color: dark ? rarity : `color-mix(in srgb, ${rarity} 70%, #000)`, bgcolor: tint(rarity, 18) }}>{butterfly.current.rarity}</Typography>
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
              <Typography color="var(--lib-muted)" sx={{ mt: 1, textAlign: 'center', fontSize: 14 }}>
                {isAuthenticated ? (short > 0 ? `Need ${short} more diamond${short > 1 ? 's' : ''}. Tap to top up.` : `You have ${diamonds} diamonds`) : 'Log in to upgrade'}
              </Typography>
            </>
          ) : (
            <Typography sx={{ textAlign: 'center', fontWeight: 700, color: COIN }}>Max level</Typography>
          )}
        </Box>
      </Box>

      <MissionsSheet open={missions} onClose={() => setMissions(false)} quests={state.quests} busy={busy} onClaim={onClaim} onSolve={(d) => { setMissions(false); onSolve(d); }} />
      <WalletSheet topUp={topUp} onClose={onCloseTopUp} coins={coins} diamonds={diamonds} rate={state.coinsPerDiamond} busy={converting} onConvert={onConvert} />
      <RewardSheet reward={reward} onClose={onCloseReward} />
    </Box>
    </LibraryFont>
  );
}
