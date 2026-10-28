import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Container,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import { feedbackApi } from '../../api/feedbackApi';
import { extractErrorMessage } from '../../api/apiClient';
import { CONTACT_EMAIL, LEGAL_LINKS, SITE_NAME } from '../legal/legalConfig';

const TYPES = [
  { value: 'question', label: 'Question' },
  { value: 'bug', label: 'Bug / something broken' },
  { value: 'feature', label: 'Feature request' },
  { value: 'payment', label: 'Payment / Pro / Store order' },
  { value: 'account', label: 'Account / login' },
  { value: 'other', label: 'Other' },
];

const FAQ = [
  {
    q: 'Password marandhuten / reset mail varala',
    a: (
      <>
        Login page-la <Link component={RouterLink} to="/forgot-password">Forgot password</Link> click pannunga. Mail 1–2 minutes-la varum; Spam / Promotions folder-um check pannunga. 6 times-ku mela try panna konjam neram wait pannanum.
      </>
    ),
  },
  {
    q: 'Verification mail varala',
    a: 'Settings → Account-la "Resend verification" irukku. Google / GitHub / LinkedIn-la login panna email auto-verified aagidum.',
  },
  {
    q: 'Code Run / Submit fail aagudhu',
    a: 'Page-a refresh pannitu thirumba try pannunga. Java, C++ compile aaga konjam neram edukkalaam. Class name "Main" nu irukkanum (Java). Continue-a fail aana, problem link + language-oda inge report pannunga.',
  },
  {
    q: 'Pro payment panniten, but Pro activate aagala',
    a: (
      <>
        Konjam seconds wait pannitu page refresh pannunga. Innum aagala na, "Payment / Pro" type select pannitu payment ID-oda inge message anuppunga. Refund rules: <Link component={RouterLink} to="/refund">Refund & Cancellation</Link>.
      </>
    ),
  },
  {
    q: 'Pro cancel panna / license key activate panna',
    a: 'Cancel: Settings → Billing. License key: profile menu → "Activate license". Cancel panna current billing period mudiyura varaikum Pro irukkum.',
  },
  {
    q: 'Store order / coins issue',
    a: (
      <>
        <Link component={RouterLink} to="/store?tab=orders">Store → Orders</Link>-la unga order status paarunga. Problem na "Payment / Pro / Store order" select pannitu order number kudunga.
      </>
    ),
  },
  {
    q: 'En data download / account delete panna mudiyuma?',
    a: 'Mudiyum. Settings → Account-la "Export my data" matrum "Delete account" irukku. Active Pro subscription irundha mudhalla cancel pannanum.',
  },
];

export default function HelpPage() {
  const [params] = useSearchParams();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const initialType = TYPES.some((t) => t.value === params.get('type')) ? params.get('type') : 'question';
  const errRef = params.get('err') || '';
  const fromPath = params.get('from') || '';

  const [type, setType] = useState(initialType);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState(errRef ? `Page crashed with: "${errRef}"\n\nWhat I was doing: ` : '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const showEmail = CONTACT_EMAIL && !CONTACT_EMAIL.includes('YOUR_EMAIL');
  const pageUrl = useMemo(() => fromPath || document.referrer || '', [fromPath]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (message.trim().length < 10) return setError('Please write at least 10 characters.');
    if (!isAuthenticated && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email so we can reply.');

    setBusy(true);
    try {
      await feedbackApi.submit({
        type,
        subject: subject.trim(),
        message: message.trim(),
        pageUrl: pageUrl.slice(0, 300),
        website,
        ...(isAuthenticated ? {} : { name: name.trim(), email: email.trim() }),
      });
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box component={RouterLink} to="/" aria-label={`${SITE_NAME} home`} sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
            <CodeRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 800 }}>{SITE_NAME}</Typography>
          </Box>
          {isAuthenticated && (
            <Button component={RouterLink} to="/dashboard" size="small" color="inherit">
              Dashboard
            </Button>
          )}
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, fontWeight: 800, mb: 0.5 }}>
          Help & Support
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Mudhalla FAQ paarunga. Answer kedaikala na keezha irukkura form-la ezhudhunga — usually 2 working days-la reply panrom.
        </Typography>

        <Typography component="h2" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 1 }}>
          Quick answers
        </Typography>
        <Box sx={{ mb: 4 }}>
          {FAQ.map((f) => (
            <Accordion key={f.q} disableGutters variant="outlined" sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {f.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Typography component="h2" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 1 }}>
          Contact us / send feedback
        </Typography>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          {sent ? (
            <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Alert severity="success" sx={{ width: '100%' }}>
                Thanks! Unga message vandhuduchu. {isAuthenticated ? 'Unga account email-ku' : 'Neenga kudutha email-ku'} reply panrom.
              </Alert>
              <Button
                onClick={() => {
                  setSent(false);
                  setSubject('');
                  setMessage('');
                }}
              >
                Send another
              </Button>
            </Stack>
          ) : (
            <Box component="form" onSubmit={submit} noValidate>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField select label="What is this about?" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
                  {TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>

                {!isAuthenticated && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} slotProps={{ htmlInput: { maxLength: 80 } }} fullWidth />
                    <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} slotProps={{ htmlInput: { maxLength: 254 } }} fullWidth />
                  </Stack>
                )}
                {isAuthenticated && (
                  <Typography variant="body2" color="text.secondary">
                    Replying to: <b>{user?.email}</b>
                  </Typography>
                )}

                <TextField label="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }} fullWidth />
                <TextField
                  label="Message"
                  required
                  multiline
                  minRows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 3000 } }}
                  helperText={`${message.length}/3000 — bug na problem link, language, enna nadandhuchu nu ezhudhunga`}
                  fullWidth
                />

                {/* Honeypot: hidden from people, bots fill it */}
                <Box aria-hidden sx={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </label>
                </Box>

                <Button type="submit" variant="contained" disableElevation disabled={busy} sx={{ fontWeight: 700, alignSelf: 'flex-start', px: 3 }}>
                  {busy ? 'Sending…' : 'Send message'}
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        {showEmail && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center', color: 'text.secondary' }}>
            <MailOutlineRoundedIcon fontSize="small" />
            <Typography variant="body2">
              Or email us: <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>
            </Typography>
          </Stack>
        )}

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 5, pt: 2 }}>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {LEGAL_LINKS.filter((l) => l.to !== '/help').map((l) => (
              <Link key={l.to} component={RouterLink} to={l.to} underline="hover" color="text.secondary" variant="body2">
                {l.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
