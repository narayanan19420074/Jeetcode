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

// Free-Fire-style building blocks shared by the Quests page and the Store: cut-corner panels, orange/green buttons,
// tags, notices and dialogs. Colours come from FF (CSS variables), so everything follows light / dark mode.

export const Diamond = ({ size = 18 }) => <DiamondRoundedIcon sx={{ fontSize: size, color: FF.diamond, filter: 'drop-shadow(0 0 5px rgba(39,182,255,0.55))' }} />;
export const Coin = ({ size = 18 }) => <MonetizationOnRoundedIcon sx={{ fontSize: size, color: FF.coin, filter: 'drop-shadow(0 1px 2px rgba(143,98,0,0.45))' }} />;

export function FFButton({ tone = 'orange', sx, children, ...props }) {
  return (
    <ButtonBase {...props} sx={[buttonSx(tone), ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </ButtonBase>
  );
}

// A cut-corner panel. `fill` swaps the inside colour (for example FF.bg for a scene frame).
export function Panel({ n = 14, fill, sx, children, ...props }) {
  return (
    <Box {...props} sx={[panelSx(n), fill ? { '--ff-fill': fill } : null, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </Box>
  );
}

// A number with its icon, e.g. diamonds or coins in the top bar. Pass `onClick` to make it a button.
export function Stat({ icon, value, color = FF.text, label, onClick }) {
  return (
    <Box
      component={onClick ? ButtonBase : 'div'}
      onClick={onClick}
      aria-label={label}
      title={label}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.75, height: 44, bgcolor: FF.hud, border: `1px solid ${FF.line}`, clipPath: cut(8), fontWeight: 900, fontSize: 16, color, fontVariantNumeric: 'tabular-nums', backdropFilter: 'blur(6px)', ...(onClick ? { cursor: 'pointer', '&:hover': { borderColor: FF.orange }, '&:focus-visible': { outline: `2px solid ${FF.orange}`, outlineOffset: 2 } } : null) }}
    >
      {icon}
      {value}
    </Box>
  );
}

export function Bar({ pct, color = FF.orange, height = 8 }) {
  return (
    <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(100, Math.max(0, pct)))} sx={{ height, bgcolor: FF.well, border: `1px solid ${FF.line}`, overflow: 'hidden' }}>
      <Box sx={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', bgcolor: color, transition: 'width .6s ease' }} />
    </Box>
  );
}

// Small label tag: 'orange' | 'green' | 'red' | 'coin' | 'dark' (or any colour through `bg`).
const TAGS = { orange: [FF.orange, '#10131A'], green: [FF.green, '#10131A'], red: [FF.red, '#FFFFFF'], coin: [FF.coin, '#10131A'], dark: [FF.panelHi, FF.text] };
export function Tag({ tone = 'dark', bg, color, children, sx }) {
  const [b, c] = TAGS[tone] || TAGS.dark;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 22, px: 1, fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', bgcolor: bg || b, color: color || c, clipPath: cut(5), ...sx }}>
      {children}
    </Box>
  );
}

// A short message strip (info / success / warning / error) in the same style.
const NOTICE = { info: FF.diamond, success: FF.green, warning: FF.orange, error: FF.red };
export function Notice({ tone = 'info', children, sx }) {
  return (
    <Box role={tone === 'error' ? 'alert' : undefined} sx={{ px: 2, py: 1.5, bgcolor: FF.well, borderLeft: `4px solid ${NOTICE[tone] || NOTICE.info}`, fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: FF.text, ...sx }}>
      {children}
    </Box>
  );
}

// Section label: small, spaced capitals.
export const Eyebrow = ({ children, sx }) => (
  <Typography sx={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: FF.muted, ...sx }}>{children}</Typography>
);

// A row of pill-like options (filters, sizes, colours). Pass `options` as [{ id, label }].
export function Choice({ options, value, onChange, label }) {
  return (
    <Box role="radiogroup" aria-label={label} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <ButtonBase
            key={o.id}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            sx={{ minHeight: 40, px: 2, fontWeight: 900, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', clipPath: cut(7), color: on ? '#10131A' : FF.text, background: on ? `linear-gradient(180deg, ${FF.orangeHi}, ${FF.orange})` : FF.panelHi, '&:hover': { filter: 'brightness(1.06)' }, '&:focus-visible': { outline: `2px solid ${FF.orange}`, outlineOffset: 2 } }}
          >
            {o.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ------------------------------------------------------------------ dialogs
export const dialogPaper = { sx: { ...panelSx(16), backgroundImage: 'none', borderRadius: 0, m: 2, width: '100%', maxWidth: 440, maxHeight: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' } };
export const dialogPaperWide = { sx: { ...dialogPaper.sx, maxWidth: 640 } };

export function DialogHead({ title, onClose }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 3, pr: 1.5, py: 1.5, borderBottom: `1px solid ${FF.line}`, background: `linear-gradient(90deg, rgba(255,122,0,0.22), transparent)`, flexShrink: 0 }}>
      <Typography component="h2" noWrap sx={{ flex: 1, fontWeight: 900, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase', color: FF.text }}>{title}</Typography>
      <IconButton aria-label="Close" onClick={onClose} sx={{ color: FF.muted, borderRadius: 0 }}>
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

// Dialog frame used by the Store: head + scrolling body + optional pinned footer.
export function FFDialog({ open, onClose, title, wide = false, footer, children, busy = false, fullScreen = false }) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullScreen={fullScreen} slotProps={{ paper: fullScreen ? { sx: { ...(wide ? dialogPaperWide : dialogPaper).sx, m: 0, maxWidth: 'none', maxHeight: '100%', height: '100%' } } : wide ? dialogPaperWide : dialogPaper }}>
      <DialogHead title={title} onClose={busy ? () => {} : onClose} />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 2.5, sm: 3 } }}>{children}</Box>
      {footer && <Box sx={{ flexShrink: 0, p: { xs: 2.5, sm: 3 }, pt: 2.5, borderTop: `1px solid ${FF.line}`, bgcolor: FF.panelHi }}>{footer}</Box>}
    </Dialog>
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
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, color: FF.muted, fontWeight: 700, fontSize: 14 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Coin /> {coins.toLocaleString('en-IN')} coins</Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Diamond /> {diamonds.toLocaleString('en-IN')} diamonds</Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, py: 3, bgcolor: FF.well, border: `1px solid ${FF.line}` }}>
          <IconButton aria-label="Fewer diamonds" onClick={() => setN((v) => Math.max(1, v - 1))} disabled={n <= 1} sx={{ color: FF.text, border: `1px solid ${FF.line}`, borderRadius: 0 }}><RemoveRoundedIcon /></IconButton>
          <Box sx={{ minWidth: 96, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 44, lineHeight: 1, color: FF.blueInk, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: FF.muted }}>DIAMONDS</Typography>
          </Box>
          <IconButton aria-label="More diamonds" onClick={() => setN((v) => Math.min(Math.max(max, 1), v + 1))} disabled={n >= max} sx={{ color: FF.text, border: `1px solid ${FF.line}`, borderRadius: 0 }}><AddRoundedIcon /></IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          {[1, 5, 10].map((v) => (
            <ButtonBase key={v} disabled={v > max} onClick={() => setN(v)} sx={{ ...buttonSx('dark'), flex: 1, minHeight: 40, px: 1 }}>{v}</ButtonBase>
          ))}
          <ButtonBase disabled={max < 1} onClick={() => setN(Math.max(max, 1))} sx={{ ...buttonSx('dark'), flex: 1, minHeight: 40, px: 1 }}>MAX</ButtonBase>
        </Box>

        <Typography sx={{ mt: 3, textAlign: 'center', fontWeight: 800, color: can ? FF.text : FF.redInk }}>
          {can ? <>{cost.toLocaleString('en-IN')} coins = {n} diamond{n > 1 ? 's' : ''}</> : `You need ${rate} coins for 1 diamond`}
        </Typography>
        <Typography sx={{ mt: 0.5, textAlign: 'center', fontSize: 13, color: FF.muted }}>{rate} coins = 1 diamond</Typography>

        <Box sx={{ mt: 3 }}>
          <FFButton tone="blue" disabled={!can || busy} onClick={() => onConvert(n)} sx={{ width: '100%', minHeight: 50 }}>
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
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {sorted.map((q) => (
          <Box key={q.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderBottom: `1px solid ${FF.line}`, opacity: q.claimed ? 0.55 : 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: 15, color: FF.text }}>{q.title}</Typography>
              <Box sx={{ my: 0.9 }}><Bar pct={(q.value / q.target) * 100} color={q.claimable ? FF.green : FF.orange} height={7} /></Box>
              <Typography noWrap sx={{ fontSize: 12.5, color: FF.muted }}>{q.value}/{q.target} · +{q.xp} XP · {q.reward.label}</Typography>
            </Box>
            {q.claimed ? (
              <CheckRoundedIcon sx={{ color: FF.greenInk }} />
            ) : q.claimable ? (
              <FFButton tone="green" disabled={busy === q.id} onClick={() => onClaim(q)} sx={{ minHeight: 40, px: 2.25 }}>Claim</FFButton>
            ) : (
              <FFButton tone="dark" onClick={() => onSolve(q.difficulty)} sx={{ minHeight: 40, px: 2.25 }}>Go</FFButton>
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
          <Box sx={{ textAlign: 'center', pb: 3 }}>
            <DialogHead title="Reward" onClose={onClose} />
            <Box sx={{ pt: 4, px: 3 }}>
              <Box sx={{ display: 'inline-grid', placeItems: 'center', width: 104, height: 104, bgcolor: FF.well, border: `2px solid ${pro ? FF.yellow : FF.diamond}`, clipPath: cut(18) }}>
                <DiamondRoundedIcon sx={{ fontSize: 60, color: pro ? FF.yellow : FF.diamond, filter: `drop-shadow(0 0 12px ${pro ? FF.yellow : FF.diamond})` }} />
              </Box>
              <Typography sx={{ mt: 3, fontWeight: 900, fontSize: 26, textTransform: 'uppercase', letterSpacing: '0.03em', color: pro ? FF.coinInk : FF.text }}>{reward.reward.label}</Typography>
              <Typography sx={{ mt: 0.75, color: FF.muted }}>{pro && reward.proUntil ? `Pro active until ${formatDate(reward.proUntil)}` : 'Added to your profile'}</Typography>
              <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center', gap: 2, fontWeight: 900 }}>
                <Box sx={{ color: FF.orangeInk }}>+{reward.xp} XP</Box>
                {reward.coins > 0 && <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: FF.coinInk }}><Coin size={18} />+{reward.coins}</Box>}
              </Box>
              <Box sx={{ mt: 4 }}>
                <FFButton tone="green" onClick={onClose} sx={{ width: '100%', minHeight: 50 }}>OK</FFButton>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
}
