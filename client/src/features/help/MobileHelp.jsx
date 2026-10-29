import { useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import BackToDashboard from '../../components/BackToDashboard';
import { tint } from '../dashboard/dashboardUtils';

// Phone layout of Help & Support. It follows the phone Problems and You pages: same page padding,
// 44px back button, centred header, pill search and buttons, 1.25rem section titles and
// divider-separated rows. Order follows how people look for help: search the answers first, then
// send a message. Chat stays in the floating launcher at the bottom right (it carries the unread badge). There is no top navigation bar on phones.

const ACCENT = '#6366F1';

function SectionTitle({ id, children }) {
  return (
    <Typography id={id} component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', mb: 1.5 }}>
      {children}
    </Typography>
  );
}

// Filled, rounded field in the same tint as the Problems search box.
const fieldSx = (t) => ({
  '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
});

function FaqRow({ item, open, onToggle }) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <ButtonBase
        onClick={onToggle}
        aria-expanded={open}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, py: 1.5, pl: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>{item.q}</Typography>
        <ExpandMoreRoundedIcon sx={{ flexShrink: 0, color: 'text.secondary', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Typography color="text.secondary" sx={{ pl: 0.5, pr: 1, pb: 1.75, fontSize: '0.92rem', lineHeight: 1.7 }}>
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
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);
  const formRef = useRef(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? faq.filter((f) => f.q.toLowerCase().includes(q)) : faq;
  }, [faq, search]);

  const goToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 12, maxWidth: 640, mx: 'auto' }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />

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
            <HelpOutlineRoundedIcon sx={{ fontSize: 44 }} />
          </Box>
          <Typography component="h1" sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            Help & Support
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
            We usually reply within 2 working days
          </Typography>

          <Button
            onClick={goToForm}
            disableElevation
            variant="contained"
            startIcon={<MailOutlineRoundedIcon />}
            sx={{ mt: 2, height: 48, px: 3.5, borderRadius: 999, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } }}
          >
            Send a message
          </Button>
        </Box>

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
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={(t) => ({
            mt: 3,
            '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          })}
        />

        {/* Quick answers */}
        <Box component="section" aria-labelledby="help-faq" sx={{ mt: 3 }}>
          <SectionTitle id="help-faq">Quick answers</SectionTitle>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {list.map((f) => (
              <FaqRow key={f.q} item={f} open={openIdx === f.q} onToggle={() => setOpenIdx((cur) => (cur === f.q ? null : f.q))} />
            ))}
            {list.length === 0 && (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 800 }}>No answers match your search</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Send us a message and we will help.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Contact form */}
        <Box component="section" aria-labelledby="help-contact" ref={formRef} sx={{ mt: 4, scrollMarginTop: 16 }}>
          <SectionTitle id="help-contact">Send a message</SectionTitle>
          {form.sent ? (
            <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Alert severity="success" sx={{ width: '100%' }}>
                Thank you. Your message has been received. We will reply to {isAuthenticated ? 'your account email' : 'the email address you provided'}.
              </Alert>
              <Button onClick={onSendAnother} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                Send another
              </Button>
            </Stack>
          ) : (
            <Box component="form" onSubmit={onSubmit} noValidate>
              <Stack spacing={1.75}>
                {form.error && <Alert severity="error">{form.error}</Alert>}

                <TextField select label="What is this about?" value={form.type} onChange={(e) => form.setType(e.target.value)} fullWidth sx={fieldSx}>
                  {types.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>

                {isAuthenticated ? (
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    Replying to: <b>{user?.email}</b>
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

                <Button
                  type="submit"
                  disabled={form.busy}
                  disableElevation
                  variant="contained"
                  fullWidth
                  sx={{ height: 48, borderRadius: 999, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } }}
                >
                  {form.busy ? 'Sending…' : 'Send message'}
                </Button>
              </Stack>
            </Box>
          )}

          {contactEmail && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Or email us: <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
            </Typography>
          )}
        </Box>

        {/* Legal links */}
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 2, mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
          {legalLinks.map((l) => (
            <Link key={l.to} component={RouterLink} to={l.to} underline="hover" color="text.secondary" variant="body2">
              {l.label}
            </Link>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
