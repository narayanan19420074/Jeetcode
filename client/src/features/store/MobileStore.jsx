import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ButtonBase, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BackToDashboard from '../../components/BackToDashboard';
import { tint } from '../dashboard/dashboardUtils';
import { Coins, ItemArt, fmt, priceNote } from './storeUtils';

// Phone layout of the Store. It follows the phone Problems and You pages: same page padding, 44px
// icon buttons, centred header, 1.25rem section titles, tinted pills and rounded tiles. The order
// is what a shopper needs first: coins and the daily reward, then categories, then items.
// Orders and the wallet still open in their dialogs (see StorePage). No top navigation bar on phones.

const ACCENT = '#6366F1';

const scrollRow = {
  display: 'flex',
  gap: 1.25,
  overflowX: 'auto',
  mx: -1.75,
  px: 1.75,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const pillBtn = { height: 44, px: 2.5, borderRadius: 999, fontWeight: 800, fontSize: '0.95rem', textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 };
const solidBtn = { ...pillBtn, bgcolor: ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } };
const tintBtn = { ...pillBtn, bgcolor: tint(ACCENT, 20), color: ACCENT, '&:hover': { bgcolor: tint(ACCENT, 30) } };

function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function Badge({ children, color }) {
  return (
    <Typography component="span" sx={{ px: 1, py: 0.3, borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.2, color, bgcolor: 'background.paper', border: `1px solid ${tint(color, 40)}` }}>
      {children}
    </Typography>
  );
}

function ItemTile({ item, balance, signedIn, onBuy, onCourse }) {
  const note = priceNote(item);
  const owned = item.owned;
  const soldOut = item.soldOut && !owned;
  const isCourse = item.kind === 'course';
  const afford = signedIn && balance >= item.price;
  const open = () => (owned || isCourse ? onCourse(item.slug) : onBuy(item));
  const label = owned ? 'Open' : soldOut ? 'Sold out' : afford ? 'Redeem' : 'View';

  return (
    <Box
      sx={(t) => ({
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: '20px',
        overflow: 'hidden',
        opacity: soldOut ? 0.65 : 1,
        bgcolor: t.palette.background.paper,
        border: `1px solid ${tint(ACCENT, 24)}`,
        boxShadow: t.palette.mode === 'dark' ? 'none' : '0 10px 22px -16px rgba(15,23,42,0.35)',
      })}
    >
      <ButtonBase onClick={open} disabled={soldOut} aria-label={`${label}: ${item.name}`} sx={{ position: 'relative', display: 'block', width: '100%' }}>
        <ItemArt art={item.art} accent={item.accent} height={132} image={item.image} />
        {(item.popular || note) && (
          <Stack direction="row" sx={{ position: 'absolute', top: 8, left: 8, gap: 0.5, flexWrap: 'wrap' }}>
            {item.popular && <Badge color={ACCENT}>Popular</Badge>}
            {note && <Badge color="#E11D48">{note}</Badge>}
          </Stack>
        )}
      </ButtonBase>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 1.5, gap: 0.5, minWidth: 0 }}>
        <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          <Coins value={item.price} size={20} />
          {!owned && signedIn && !afford && !soldOut && (
            <Typography color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.25 }}>
              Need {fmt(item.price - balance)} more
            </Typography>
          )}
        </Box>
        <Button onClick={open} disabled={soldOut} fullWidth disableElevation variant="contained" sx={{ ...(afford && !owned ? solidBtn : tintBtn), mt: 1, height: 40, px: 1 }}>
          {label}
        </Button>
      </Box>
    </Box>
  );
}

export default function MobileStore({
  isAuthenticated,
  balance,
  daily,
  claiming,
  onClaim,
  inTransit,
  onOrders,
  onWallet,
  onSignIn,
  courses,
  onCourse,
  merchLocked,
  minSolved,
  solved,
  categories,
  cat,
  onCat,
  items,
  loading,
  error,
  onBuy,
}) {
  return (
    <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back + orders */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
        {isAuthenticated && (
          <IconButton
            onClick={onOrders}
            aria-label={inTransit > 0 ? `My orders, ${inTransit} in transit` : 'My orders'}
            sx={(t) => ({ position: 'relative', width: 44, height: 44, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9), color: ACCENT })}
          >
            <LocalMallRoundedIcon />
            {inTransit > 0 && <Box aria-hidden sx={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: '50%', bgcolor: 'error.main' }} />}
          </IconButton>
        )}
      </Stack>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            mx: 'auto',
            borderRadius: '26px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 60%, #000))`,
            boxShadow: `0 14px 26px -12px ${ACCENT}`,
          }}
        >
          <StorefrontRoundedIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography component="h1" sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          Store
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          Spend the coins you earn by solving
        </Typography>
      </Box>

      {/* Coins and the daily reward */}
      <Box
        sx={(t) => ({
          mt: 2.5,
          p: 1.75,
          borderRadius: '26px',
          background: `linear-gradient(160deg, ${tint(ACCENT, t.palette.mode === 'dark' ? 20 : 15)} 0%, ${tint(ACCENT, 4)} 62%, transparent 100%)`,
          border: `1px solid ${tint(ACCENT, 24)}`,
        })}
      >
        {isAuthenticated ? (
          <>
            <ButtonBase onClick={onWallet} aria-label="Open coin wallet" sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}>
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                  Your coins
                </Typography>
                <Coins value={balance} size={30} />
              </Box>
              <Stack direction="row" sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Wallet</Typography>
                <ChevronRightRoundedIcon />
              </Stack>
            </ButtonBase>

            {daily?.eligible ? (
              <Button onClick={onClaim} disabled={claiming} fullWidth disableElevation variant="contained" sx={{ ...solidBtn, mt: 1.5, height: 48 }}>
                {claiming ? 'Claiming…' : `Claim +${daily.reward} daily coins`}
              </Button>
            ) : daily && !daily.claimed ? (
              <Button component={RouterLink} to="/problems" fullWidth disableElevation variant="contained" sx={{ ...tintBtn, mt: 1.5, height: 48 }}>
                Solve 1 problem for daily coins
              </Button>
            ) : daily?.claimed ? (
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1.5, color: 'text.secondary' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'var(--jc-easy)' }} />
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Checked in today</Typography>
              </Stack>
            ) : null}
          </>
        ) : (
          <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1.25 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              Sign in to see your coins and redeem items.
            </Typography>
            <Button onClick={onSignIn} disableElevation variant="contained" sx={{ ...solidBtn, height: 48, px: 4 }}>
              Sign in
            </Button>
          </Stack>
        )}
      </Box>

      {error && (
        <Typography role="alert" color="error" sx={{ mt: 2, fontSize: '0.9rem' }}>
          {error}
        </Typography>
      )}

      {/* Courses in progress */}
      {courses.length > 0 && (
        <Box component="section" aria-label="Continue learning" sx={{ mt: 3.5 }}>
          <SectionTitle>Continue learning</SectionTitle>
          <Box sx={scrollRow}>
            {courses.map((c) => (
              <ButtonBase
                key={c.slug}
                onClick={() => onCourse(c.slug)}
                sx={(t) => ({
                  flex: '0 0 auto',
                  width: 'min(64vw, 240px)',
                  display: 'block',
                  p: 1.75,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  borderRadius: '20px',
                  color: t.palette.text.primary,
                  bgcolor: t.palette.background.paper,
                  border: `1px solid ${tint(ACCENT, 30)}`,
                })}
              >
                <Typography noWrap sx={{ fontWeight: 800, fontSize: '1rem' }}>
                  {c.name}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.4, fontVariantNumeric: 'tabular-nums' }}>
                  {c.progress.doneCount}/{c.progress.lessonCount} lessons
                </Typography>
                <Box role="progressbar" aria-label={`${c.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progress.percent} sx={{ mt: 1, height: 5, borderRadius: 99, bgcolor: tint(ACCENT, 20), overflow: 'hidden' }}>
                  <Box sx={{ width: `${c.progress.percent}%`, height: '100%', borderRadius: 99, bgcolor: ACCENT }} />
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </Box>
      )}

      {merchLocked && (
        <Stack direction="row" sx={(t) => ({ mt: 3, p: 1.5, gap: 1.25, alignItems: 'center', borderRadius: '20px', bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) })}>
          <LockRoundedIcon sx={{ fontSize: 20, color: ACCENT, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.9rem' }}>
            Merch unlocks after you solve {minSolved} problems. You have solved {solved}.
          </Typography>
        </Stack>
      )}

      {/* Categories */}
      <Box sx={{ ...scrollRow, mt: 3, gap: 0.75 }} role="tablist" aria-label="Categories">
        {categories.map((c) => {
          const on = c.id === cat;
          return (
            <ButtonBase
              key={c.id}
              role="tab"
              aria-selected={on}
              onClick={() => onCat(c.id)}
              sx={(t) => ({
                flexShrink: 0,
                height: 40,
                px: 2,
                borderRadius: 999,
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: on ? 800 : 700,
                whiteSpace: 'nowrap',
                color: on ? ACCENT : t.palette.text.secondary,
                bgcolor: on ? tint(ACCENT, 20) : 'transparent',
              })}
            >
              {c.label}
            </ButtonBase>
          );
        })}
      </Box>

      {/* Items */}
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={250} sx={{ borderRadius: '20px' }} />
            ))}
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800 }}>Nothing here yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Try another category.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {items.map((it) => (
              <ItemTile key={it.slug} item={it} balance={balance} signedIn={isAuthenticated} onBuy={onBuy} onCourse={onCourse} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
