import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ButtonBase, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libChipSx,
  libIconBtnSx,
  libSectionTitleSx,
  libSolidBtnSx,
  libTintBtnSx,
} from '../dashboard/components/libraryStyle';
import { Coins, ItemArt, fmt, priceNote } from './storeUtils';

// Phone layout of the Store in the Library look (same as the phone Problems, Home and You pages): Roboto type,
// warm surface, 16px page padding, 40px icon buttons, centred header tile, 18px section titles, cream tiles. The order
// is what a shopper needs first: coins and the daily reward, then categories, then items.
// Orders and the wallet open as full phone screens (see MobileAccount). No top navigation bar on phones.

const ACCENT = LIB_ACCENT;

const scrollRow = {
  display: 'flex',
  gap: 1.25,
  overflowX: 'auto',
  mx: -2,
  px: 2,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const solidBtn = libSolidBtnSx;
const tintBtn = libTintBtnSx;

function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function Badge({ children, color }) {
  return (
    <Typography component="span" sx={{ px: 1, py: 0.3, borderRadius: 99, fontSize: 12, fontWeight: 500, lineHeight: 1.2, color, bgcolor: 'var(--lib-bg)', border: `1px solid ${tint(color, 40)}` }}>
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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: '16px',
        overflow: 'hidden',
        opacity: soldOut ? 0.65 : 1,
        bgcolor: 'var(--lib-chip)',
        border: '1px solid var(--lib-border)',
      }}
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
        <Typography component="h3" sx={{ fontWeight: 500, fontSize: 16, lineHeight: '22px', letterSpacing: LIB_TRACKING, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          <Coins value={item.price} size={20} />
          {!owned && signedIn && !afford && !soldOut && (
            <Typography color="var(--lib-muted)" sx={{ fontSize: 13, mt: 0.25 }}>
              Need {fmt(item.price - balance)} more
            </Typography>
          )}
        </Box>
        <Button onClick={open} disabled={soldOut} fullWidth disableElevation variant="contained" sx={{ ...(afford && !owned ? solidBtn : tintBtn), mt: 1, height: 40, px: 1, fontSize: 16 }}>
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
    <LibraryFont>
    <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back + orders */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        {isAuthenticated && (
          <IconButton
            onClick={onOrders}
            aria-label={inTransit > 0 ? `My orders, ${inTransit} in transit` : 'My orders'}
            sx={{ ...libIconBtnSx, position: 'relative' }}
          >
            <LocalMallRoundedIcon />
            {inTransit > 0 && <Box aria-hidden sx={{ position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: '50%', bgcolor: 'error.main' }} />}
          </IconButton>
        )}
      </Stack>

      {/* Header */}
      <PageHeader icon={StorefrontRoundedIcon} title="Store" subtitle="Spend the coins you earn by solving" />

      {/* Coins and the daily reward */}
      <Box sx={{ mt: 3, p: 2, borderRadius: '20px', bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}>
        {isAuthenticated ? (
          <>
            <ButtonBase onClick={onWallet} aria-label="Open coin wallet" sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}>
              <Box>
                <Typography color="var(--lib-muted)" sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>
                  Your coins
                </Typography>
                <Coins value={balance} size={30} />
              </Box>
              <Stack direction="row" sx={{ alignItems: 'center', color: 'var(--lib-muted)' }}>
                <Typography sx={{ fontWeight: 500, fontSize: 15, letterSpacing: LIB_TRACKING }}>Wallet</Typography>
                <ChevronRightRoundedIcon />
              </Stack>
            </ButtonBase>

            {daily?.eligible ? (
              <Button onClick={onClaim} disabled={claiming} fullWidth disableElevation variant="contained" sx={{ ...solidBtn, mt: 1.5 }}>
                {claiming ? 'Claiming…' : `Claim +${daily.reward} daily coins`}
              </Button>
            ) : daily && !daily.claimed ? (
              <Button component={RouterLink} to="/problems" fullWidth disableElevation variant="contained" sx={{ ...tintBtn, mt: 1.5 }}>
                Solve 1 problem for daily coins
              </Button>
            ) : daily?.claimed ? (
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1.5, color: 'var(--lib-muted)' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'var(--jc-easy)' }} />
                <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING }}>Checked in today</Typography>
              </Stack>
            ) : null}
          </>
        ) : (
          <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: 1.25 }}>
            <Typography color="var(--lib-muted)" sx={{ fontSize: 16 }}>
              Sign in to see your coins and redeem items.
            </Typography>
            <Button onClick={onSignIn} disableElevation variant="contained" sx={{ ...solidBtn, px: 4 }}>
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
        <Box component="section" aria-label="Continue learning" sx={{ mt: 4 }}>
          <SectionTitle>Continue learning</SectionTitle>
          <Box sx={scrollRow}>
            {courses.map((c) => (
              <ButtonBase
                key={c.slug}
                onClick={() => onCourse(c.slug)}
                sx={{
                  flex: '0 0 auto',
                  width: 'min(64vw, 240px)',
                  display: 'block',
                  p: 2,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  borderRadius: '16px',
                  color: 'var(--lib-text)',
                  bgcolor: 'var(--lib-chip)',
                  border: '1px solid var(--lib-border)',
                }}
              >
                <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
                  {c.name}
                </Typography>
                <Typography color="var(--lib-muted)" sx={{ fontSize: 14, mt: 0.4, fontVariantNumeric: 'tabular-nums' }}>
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
        <Stack direction="row" sx={{ mt: 3, p: 2, gap: 1.25, alignItems: 'center', borderRadius: '16px', bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}>
          <LockRoundedIcon sx={{ fontSize: 20, color: ACCENT, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING }}>
            Merch unlocks after you solve {minSolved} problems. You have solved {solved}.
          </Typography>
        </Stack>
      )}

      {/* Categories */}
      <Box sx={{ ...scrollRow, mt: 3, gap: 1 }} role="tablist" aria-label="Categories">
        {categories.map((c) => {
          const on = c.id === cat;
          return (
            <ButtonBase
              key={c.id}
              role="tab"
              aria-selected={on}
              onClick={() => onCat(c.id)}
              sx={libChipSx(on)}
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
            <Typography sx={{ fontWeight: 700 }}>Nothing here yet</Typography>
            <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5 }}>
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
    </LibraryFont>
  );
}
