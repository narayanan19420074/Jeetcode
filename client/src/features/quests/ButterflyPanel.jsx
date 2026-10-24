import { Box, ButtonBase, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { paletteFor, rarityGradient, RARITY } from './butterflyCatalog';
import { BadgeTile, GemTile } from './QuestParts';
import { VIBRANT } from './questUtils';

const slide = keyframes`0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; }`;

function RarityPill({ name }) {
  const legendary = name === 'Legendary';
  const r = RARITY[name] || RARITY.Starter;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block', px: 0.9, py: 0.15, borderRadius: 99, color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1.5,
        background: rarityGradient(name), backgroundSize: legendary ? '200% 100%' : '100% 100%', boxShadow: `0 6px 12px -6px ${r.glow}, inset 0 1px 0 rgba(255,255,255,0.45)`,
        ...(legendary && { animation: `${slide} 3s linear infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }),
      }}
    >
      {name}
    </Box>
  );
}

function Thumb({ item, thumb, T }) {
  const pal = paletteFor(item.id);
  return (
    <Box
      sx={{
        position: 'relative', width: 64, height: 64, flexShrink: 0, borderRadius: '20px', display: 'grid', placeItems: 'center', overflow: 'hidden',
        bgcolor: T.soft, boxShadow: T.pressed, backgroundImage: `radial-gradient(circle at 50% 45%, ${pal.glow}${T.dark ? '55' : '40'}, transparent 70%)`,
      }}
    >
      {thumb ? (
        <Box component="img" src={thumb} alt="" draggable={false} sx={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'filter .3s ease', ...(!item.owned && { filter: 'grayscale(0.85) brightness(0.8)', opacity: 0.85 }) }} />
      ) : (
        <AutoAwesomeRoundedIcon sx={{ color: pal.glow, fontSize: 28 }} />
      )}
      {!item.owned && (
        <Box sx={{ position: 'absolute', right: 3, bottom: 3, width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', bgcolor: 'rgba(15,12,45,0.82)' }}>
          <LockRoundedIcon sx={{ fontSize: 12 }} />
        </Box>
      )}
    </Box>
  );
}

function Action({ item, equipped, coins, busy, isAuthenticated, onUnlock, onEquip, onLogin, T }) {
  const pill = { minWidth: 88, height: 38, px: 1.5, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontWeight: 900, fontSize: 13, fontFamily: 'inherit', whiteSpace: 'nowrap' };

  if (equipped) {
    return (
      <Box sx={{ ...pill, color: '#fff', background: VIBRANT.lime.bg, boxShadow: `0 8px 16px -8px ${VIBRANT.lime.glow}, inset 0 1px 0 rgba(255,255,255,0.5)` }}>
        <CheckRoundedIcon sx={{ fontSize: 17 }} /> On stage
      </Box>
    );
  }
  if (item.owned) {
    return (
      <ButtonBase onClick={onEquip} disabled={busy} aria-label={`Put ${item.name} on stage`} sx={{ ...pill, color: T.icon, bgcolor: T.soft, boxShadow: T.raised, '&:active': { boxShadow: T.pressed } }}>
        {busy ? '…' : 'Equip'}
      </ButtonBase>
    );
  }
  if (!isAuthenticated) {
    return (
      <ButtonBase onClick={onLogin} sx={{ ...pill, color: T.icon, bgcolor: T.soft, boxShadow: T.raised }}>
        Log in
      </ButtonBase>
    );
  }
  const need = item.cost - coins;
  const affordable = need <= 0;
  return (
    <Tooltip title={affordable ? `Unlock for ${item.cost.toLocaleString('en-IN')} coins` : `Need ${need.toLocaleString('en-IN')} more coins`} arrow>
      <span>
        <ButtonBase
          onClick={onUnlock}
          disabled={busy || !affordable}
          aria-label={`Unlock ${item.name} for ${item.cost} coins`}
          sx={{
            ...pill,
            ...(affordable
              ? { color: '#fff', background: VIBRANT.diamond.bg, boxShadow: `0 10px 18px -8px ${VIBRANT.diamond.glow}, inset 0 1px 0 rgba(255,255,255,0.5)`, '&:active': { transform: 'scale(0.97)' } }
              : { color: T.muted, bgcolor: T.soft, boxShadow: T.pressed }),
            '&.Mui-disabled': affordable ? { opacity: 0.7 } : { opacity: 1 },
          }}
        >
          <DiamondRoundedIcon sx={{ fontSize: 16 }} />
          {busy ? '…' : item.cost.toLocaleString('en-IN')}
        </ButtonBase>
      </span>
    </Tooltip>
  );
}

// Right sidebar of the Quests page: every butterfly with its real 3D wings, rarity badge and a price in coins.
// Tapping a row previews it on the stage; Unlock spends coins on the server, Equip puts it on the stage for good.
export default function ButterflyPanel({ butterflies, selected, coins, isAuthenticated, busyId, thumbs, onSelect, onUnlock, onEquip, onLogin, T }) {
  const owned = butterflies.items.filter((b) => b.owned).length;
  return (
    <Box component="aside" aria-label="Butterfly collection" sx={{ position: 'relative', overflow: 'hidden', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', borderRadius: '28px', p: 2, background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.32), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.26), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        <GemTile size={42} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 19, lineHeight: 1.2, letterSpacing: '-0.01em', color: T.ink }}>Butterflies</Typography>
          <Typography noWrap sx={{ fontSize: 12.5, color: T.muted }}>{owned} of {butterflies.items.length} unlocked</Typography>
        </Box>
        {isAuthenticated && (
          <Tooltip title="Your coins" arrow>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, pl: 0.6, pr: 1.4, py: 0.5, borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed }}>
              <BadgeTile colors={VIBRANT.diamond} size={26} radius={13}>
                <DiamondRoundedIcon sx={{ fontSize: 15 }} />
              </BadgeTile>
              <Typography sx={{ fontWeight: 900, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: T.ink }}>{coins.toLocaleString('en-IN')}</Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      <Box className="autohide-scroll" component="ul" sx={{ position: 'relative', listStyle: 'none', m: 0, p: 0, mt: 1.75, flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gap: 1.1, alignContent: 'start', pr: 0.5, pb: 0.5 }}>
        {butterflies.items.map((b) => {
          const pal = paletteFor(b.id);
          const isSel = selected === b.id;
          const equipped = butterflies.active === b.id;
          return (
            <Box
              component="li"
              key={b.id}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: '22px', bgcolor: T.soft, boxShadow: isSel ? T.pressed : T.raised,
                border: '1.5px solid', borderColor: isSel ? pal.glow : 'transparent', transition: 'box-shadow .2s ease, border-color .2s ease',
              }}
            >
              <ButtonBase onClick={() => onSelect(b.id)} aria-pressed={isSel} aria-label={`Preview ${b.name}`} sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.25, textAlign: 'left', borderRadius: '16px', fontFamily: 'inherit' }}>
                <Thumb item={b} thumb={thumbs?.[b.id]} T={T} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap title={b.name} sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, color: T.ink }}>{b.name}</Typography>
                  <RarityPill name={b.rarity} />
                  <Typography noWrap sx={{ mt: 0.3, fontSize: 11.5, color: T.muted }}>{b.owned ? (equipped ? 'Flying on your stage' : 'Unlocked') : isSel ? 'Previewing, not yet yours' : 'Tap to preview'}</Typography>
                </Box>
              </ButtonBase>
              <Action item={b} equipped={equipped} coins={coins} busy={busyId === b.id} isAuthenticated={isAuthenticated} onUnlock={() => onUnlock(b)} onEquip={() => onEquip(b)} onLogin={onLogin} T={T} />
            </Box>
          );
        })}
      </Box>

      <Typography sx={{ position: 'relative', mt: 1.25, fontSize: 11.5, color: T.muted, textAlign: 'center', flexShrink: 0 }}>
        Earn coins by solving problems and claiming quests.
      </Typography>
    </Box>
  );
}
