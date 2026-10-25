import { useEffect, useState } from 'react';
import { Box, ButtonBase, Dialog, IconButton, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { Confetti } from '../aptitude/components/MotionBits';
import { FF, buttonSx, cut, formatDate, panelSx } from './questUtils';

// Small Free-Fire-style building blocks for the Quests page: cut-corner panels, orange/green buttons, plain labels.

export const Diamond = ({ size = 18 }) => <DiamondRoundedIcon sx={{ fontSize: size, color: FF.diamond, filter: `drop-shadow(0 0 6px ${FF.diamond})` }} />;
export const Coin = ({ size = 18 }) => <MonetizationOnRoundedIcon sx={{ fontSize: size, color: FF.coin }} />;

export function FFButton({ tone = 'orange', sx, children, ...props }) {
  return (
    <ButtonBase {...props} sx={[buttonSx(tone), ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </ButtonBase>
  );
}

// A number with its icon, e.g. diamonds or coins in the top bar.
export function Stat({ icon, value, color = FF.text, label }) {
  return (
    <Box aria-label={label} title={label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, height: 40, bgcolor: 'rgba(11,14,20,0.82)', border: `1px solid ${FF.line}`, clipPath: cut(8), fontWeight: 900, fontSize: 16, color, fontVariantNumeric: 'tabular-nums' }}>
      {icon}
      {value}
    </Box>
  );
}

export function Bar({ pct, color = FF.orange, height = 8 }) {
  return (
    <Box sx={{ height, bgcolor: '#0B0E14', border: `1px solid ${FF.line}`, overflow: 'hidden' }}>
      <Box sx={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', bgcolor: color, transition: 'width .6s ease' }} />
    </Box>
  );
}

const dialogPaper = { sx: { ...panelSx, backgroundImage: 'none', borderRadius: 0, m: 2, width: '100%', maxWidth: 420 } };

function DialogHead({ title, onClose }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25, borderBottom: `1px solid ${FF.line}`, background: `linear-gradient(90deg, ${FF.orange}33, transparent)` }}>
      <Typography sx={{ flex: 1, fontWeight: 900, fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', color: FF.text }}>{title}</Typography>
      <IconButton aria-label="Close" onClick={onClose} size="small" sx={{ color: FF.muted }}>
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

// ------------------------------------------------------------------ top up
// Coins -> diamonds. The rate comes from the server (100 coins = 1 diamond).
export function TopUpDialog({ open, onClose, coins, diamonds, rate, want, busy, onConvert }) {
  const max = Math.max(0, Math.floor(coins / rate));
  const [n, setN] = useState(1);
  useEffect(() => {
    if (open) setN(Math.min(Math.max(want || 1, 1), Math.max(max, 1)));
  }, [open, want, max]);
  const cost = n * rate;
  const can = n >= 1 && n <= max;

  return (
    <Dialog open={open} onClose={onClose} slotProps={{ paper: dialogPaper }}>
      <DialogHead title="Top up diamonds" onClose={onClose} />
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, color: FF.muted, fontWeight: 700, fontSize: 14 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}><Coin /> {coins.toLocaleString('en-IN')} coins</Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}><Diamond /> {diamonds.toLocaleString('en-IN')} diamonds</Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 2, bgcolor: '#0B0E14', border: `1px solid ${FF.line}` }}>
          <IconButton aria-label="Fewer diamonds" onClick={() => setN((v) => Math.max(1, v - 1))} disabled={n <= 1} sx={{ color: FF.text, border: `1px solid ${FF.line}`, borderRadius: 0 }}><RemoveRoundedIcon /></IconButton>
          <Box sx={{ minWidth: 96, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 40, lineHeight: 1, color: FF.diamond, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: FF.muted }}>DIAMONDS</Typography>
          </Box>
          <IconButton aria-label="More diamonds" onClick={() => setN((v) => Math.min(Math.max(max, 1), v + 1))} disabled={n >= max} sx={{ color: FF.text, border: `1px solid ${FF.line}`, borderRadius: 0 }}><AddRoundedIcon /></IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
          {[1, 5, 10].map((v) => (
            <ButtonBase key={v} disabled={v > max} onClick={() => setN(v)} sx={{ ...buttonSx('dark'), flex: 1, minHeight: 36, px: 1 }}>{v}</ButtonBase>
          ))}
          <ButtonBase disabled={max < 1} onClick={() => setN(Math.max(max, 1))} sx={{ ...buttonSx('dark'), flex: 1, minHeight: 36, px: 1 }}>MAX</ButtonBase>
        </Box>

        <Typography sx={{ mt: 2, textAlign: 'center', fontWeight: 800, color: can ? FF.text : FF.red }}>
          {can ? <>{cost.toLocaleString('en-IN')} coins = {n} diamond{n > 1 ? 's' : ''}</> : `You need ${rate} coins for 1 diamond`}
        </Typography>
        <Typography sx={{ textAlign: 'center', fontSize: 12.5, color: FF.muted }}>{rate} coins = 1 diamond</Typography>

        <Box sx={{ mt: 2.5 }}>
          <FFButton tone="blue" disabled={!can || busy} onClick={() => onConvert(n)} sx={{ width: '100%' }}>
            {busy ? 'Converting…' : 'Convert'}
          </FFButton>
        </Box>
      </Box>
    </Dialog>
  );
}

// ------------------------------------------------------------------ missions
// Everything that is not on the road: streaks, problems solved, difficulty goals.
export function MissionsDialog({ open, onClose, quests, busy, onClaim, onSolve }) {
  const sorted = [...quests].sort((a, b) => Number(b.claimable) - Number(a.claimable) || Number(a.claimed) - Number(b.claimed) || b.value / b.target - a.value / a.target);
  return (
    <Dialog open={open} onClose={onClose} scroll="paper" slotProps={{ paper: dialogPaper }}>
      <DialogHead title="Missions" onClose={onClose} />
      <Box sx={{ overflowY: 'auto' }}>
        {sorted.map((q) => (
          <Box key={q.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: `1px solid ${FF.line}`, opacity: q.claimed ? 0.5 : 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: 14.5, color: FF.text }}>{q.title}</Typography>
              <Box sx={{ my: 0.6 }}><Bar pct={(q.value / q.target) * 100} color={q.claimable ? FF.green : FF.orange} height={6} /></Box>
              <Typography noWrap sx={{ fontSize: 12, color: FF.muted }}>{q.value}/{q.target} · +{q.xp} XP · {q.reward.label}</Typography>
            </Box>
            {q.claimed ? (
              <CheckRoundedIcon sx={{ color: FF.green }} />
            ) : q.claimable ? (
              <FFButton tone="green" disabled={busy === q.id} onClick={() => onClaim(q)} sx={{ minHeight: 36, px: 2 }}>Claim</FFButton>
            ) : (
              <FFButton tone="dark" onClick={() => onSolve(q.difficulty)} sx={{ minHeight: 36, px: 2 }}>Go</FFButton>
            )}
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}

// ------------------------------------------------------------------ reward
export function RewardDialog({ reward, onClose }) {
  const open = Boolean(reward);
  const pro = reward?.reward?.type === 'pro';
  return (
    <>
      {open && <Confetti key={reward.claimed} pieces={90} />}
      <Dialog open={open} onClose={onClose} slotProps={{ paper: dialogPaper }}>
        {reward && (
          <Box sx={{ textAlign: 'center', pb: 2.5 }}>
            <DialogHead title="Reward" onClose={onClose} />
            <Box sx={{ pt: 3, px: 2.5 }}>
              <Box sx={{ display: 'inline-grid', placeItems: 'center', width: 96, height: 96, bgcolor: '#0B0E14', border: `2px solid ${pro ? FF.yellow : FF.diamond}`, clipPath: cut(16) }}>
                <DiamondRoundedIcon sx={{ fontSize: 56, color: pro ? FF.yellow : FF.diamond, filter: `drop-shadow(0 0 12px ${pro ? FF.yellow : FF.diamond})` }} />
              </Box>
              <Typography sx={{ mt: 2, fontWeight: 900, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.03em', color: pro ? FF.yellow : FF.text }}>{reward.reward.label}</Typography>
              <Typography sx={{ mt: 0.5, color: FF.muted }}>{pro && reward.proUntil ? `Pro active until ${formatDate(reward.proUntil)}` : 'Added to your profile'}</Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1.5, fontWeight: 900 }}>
                <Box sx={{ color: FF.orangeHi }}>+{reward.xp} XP</Box>
                {reward.coins > 0 && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color: FF.coin }}><Coin size={18} />+{reward.coins}</Box>}
              </Box>
              <Box sx={{ mt: 3 }}>
                <FFButton tone="green" onClick={onClose} sx={{ width: '100%' }}>OK</FFButton>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
}
