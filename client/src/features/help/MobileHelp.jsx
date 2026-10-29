import { useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIB_ACCENT,
  LIB_FONT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libSearchSx,
  libSectionTitleSx,
  libSolidBtnSx,
  libTintBtnSx,
  useLibraryPalette,
} from '../dashboard/components/libraryStyle';

// Phone layout of Help & Support in the Library look (same as the phone Home, Problems, Friends and Explore pages):
// Roboto type, warm surface, 16px page padding, 44px back arrow, centred header tile, 44px pill search,
// 18px section titles with 32px between sections, divider-separated rows and 48px pill buttons.
// Order follows how people look for help: search the answers first, then send a message. Chat stays in the
// floating launcher at the bottom right (it carries the unread badge). There is no top navigation bar on phones.

// Rich purple gradient from the phone home banners, used for the main actions on this page.
const HELP_GRADIENT = 'linear-gradient(135deg,#7E3FA8,#4A1F8C)';
const gradientBtnSx = {
  ...libSolidBtnSx,
  color: '#fff',
  background: HELP_GRADIENT,
  '&:hover': { background: HELP_GRADIENT, filter: 'brightness(1.1)' },
  '&.Mui-disabled': { color: '#fff', opacity: 0.6 },
};

function SectionTitle({ id, children }) {
  return (
    <Typography id={id} component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

// Filled, rounded field in the same cream as the search box and cards.
const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'var(--lib-player)', fontSize: 16, letterSpacing: LIB_TRACKING, color: 'var(--lib-text)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
  '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: `0 0 0 2px ${LIB_ACCENT}` },
  '& .MuiInputLabel-root': { color: 'var(--lib-muted)', fontSize: 16 },
  '& .MuiInputLabel-root.Mui-focused': { color: LIB_ACCENT },
  '& .MuiFormHelperText-root': { mx: 0.5, fontSize: 14, lineHeight: '20px', color: 'var(--lib-muted)' },
};

const answerLinkSx = { '& a': { color: LIB_ACCENT } };

function FaqRow({ item, open, onToggle }) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        onClick={onToggle}
        aria-expanded={open}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', py: '12px', textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{item.q}</Typography>
        <ExpandMoreRoundedIcon aria-hidden sx={{ flexShrink: 0, color: 'var(--lib-muted)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Typography component="div" sx={{ pb: 2, fontSize: 15, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)', ...answerLinkSx }}>
          {item.a}
        </Typography>
      </Collapse>
    </Box>
  );
}

export default function MobileHelp({
  faq,
  types,
  isAuthenticated,
  user,
  form,
  onSubmit,
  onSendAnother,
  contactEmail,
  legalLinks,
}) {
  const pal = useLibraryPalette();
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);
  const formRef = useRef(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? faq.filter((f) => f.q.toLowerCase().includes(q)) : faq;
  }, [faq, search]);

  const goToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <LibraryFont sx={{ minHeight: '100dvh', bgcolor: pal.bg }}>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 12, maxWidth: 640, mx: 'auto' }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>

        {/* Header */}
        <PageHeader icon={HelpOutlineRoundedIcon} title="Help & Support" subtitle="Find answers or contact us" />

        {/* Contact card: same look as the home banners (gradient, white text, icon ring) */}
        <ButtonBase
          onClick={goToForm}
          aria-label="Send a message"
          sx={{ mt: 3, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, borderRadius: '20px', textAlign: 'left', color: '#fff', fontFamily: 'inherit', background: HELP_GRADIENT }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 22, lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.01em' }}>Send us a message</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'rgba(255,255,255,0.85)' }}>We usually reply within 2 working days</Typography>
          </Box>
          <Box aria-hidden sx={{ flex: 'none', width: 60, height: 60, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '5px solid rgba(255,255,255,0.55)', background: 'linear-gradient(160deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))' }}>
            <MailOutlineRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
        </ButtonBase>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search help"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': 'Search help' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon aria-hidden sx={{ color: 'var(--lib-muted)' }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{ ...libSearchSx, mt: 3 }}
        />

        {/* Quick answers */}
        <Box component="section" aria-labelledby="help-faq" sx={{ mt: 4 }}>
          <SectionTitle id="help-faq">Quick answers</SectionTitle>
          <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
            {list.map((f) => (
              <FaqRow key={f.q} item={f} open={openIdx === f.q} onToggle={() => setOpenIdx((cur) => (cur === f.q ? null : f.q))} />
            ))}
            {list.length === 0 && (
              <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>No answers match your search</Typography>
                <Typography sx={{ mt: 0.5, fontSize: 14, lineHeight: '20px', color: 'var(--lib-muted)' }}>Send us a message and we will help.</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Contact form */}
        <Box component="section" aria-labelledby="help-contact" ref={formRef} sx={{ mt: 4, scrollMarginTop: 16 }}>
          <SectionTitle id="help-contact">Send a message</SectionTitle>
          {form.sent ? (
            <Box role="status" sx={(t) => ({ p: '12px', borderRadius: '16px', border: '1.5px solid var(--lib-border)', bgcolor: t.palette.mode === 'dark' ? tint('#22A06B', 16) : '#EAF6EE' })}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: '12px' }}>
                <CheckCircleRoundedIcon aria-hidden sx={{ fontSize: 28, color: '#22A06B', flex: 'none' }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>Message sent</Typography>
                  <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
                    We will reply to {isAuthenticated ? 'your account email' : 'the email address you provided'}.
                  </Typography>
                </Box>
              </Stack>
              <Button onClick={onSendAnother} fullWidth disableElevation sx={{ ...libTintBtnSx, mt: 1.5, bgcolor: 'var(--lib-bg)' }}>
                Send another
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={onSubmit} noValidate>
              <Stack spacing={1.75}>
                {form.error && <Alert severity="error">{form.error}</Alert>}

                <TextField
                  select
                  label="What is this about?"
                  value={form.type}
                  onChange={(e) => form.setType(e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  slotProps={{ select: { MenuProps: { slotProps: { paper: { sx: { borderRadius: '16px' } } } } } }}
                >
                  {types.map((t) => (
                    <MenuItem key={t.value} value={t.value} sx={{ minHeight: 48, fontSize: 16, fontFamily: LIB_FONT, letterSpacing: LIB_TRACKING }}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>

                {isAuthenticated ? (
                  <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)', wordBreak: 'break-word' }}>
                    Replying to <Box component="span" sx={{ fontWeight: 500, color: 'var(--lib-text)' }}>{user?.email}</Box>
                  </Typography>
                ) : (
                  <TextField
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => form.setEmail(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 254 } }}
                    fullWidth
                    sx={fieldSx}
                  />
                )}

                <TextField
                  label="Message"
                  required
                  multiline
                  minRows={5}
                  value={form.message}
                  onChange={(e) => form.setMessage(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 3000 } }}
                  helperText={`${form.message.length}/3000. For bugs, include the problem link, language and what happened.`}
                  fullWidth
                  sx={fieldSx}
                />

                {/* Honeypot: hidden from people, bots fill it */}
                <Box aria-hidden sx={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => form.setWebsite(e.target.value)} />
                  </label>
                </Box>

                <Button type="submit" disabled={form.busy} disableElevation variant="contained" fullWidth sx={gradientBtnSx}>
                  {form.busy ? 'Sending…' : 'Send message'}
                </Button>
              </Stack>
            </Box>
          )}

          {contactEmail && (
            <Typography sx={{ mt: 2, textAlign: 'center', fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
              Or email us at{' '}
              <Link href={`mailto:${contactEmail}`} sx={{ color: LIB_ACCENT }}>
                {contactEmail}
              </Link>
            </Typography>
          )}
        </Box>

        {/* Legal links */}
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
          {legalLinks.map((l) => (
            <Link key={l.to} component={RouterLink} to={l.to} underline="hover" sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
              {l.label}
            </Link>
          ))}
        </Stack>
      </Box>
    </LibraryFont>
  );
}
