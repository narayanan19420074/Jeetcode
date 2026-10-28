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
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import SupportChat from './SupportChat';
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
    q: 'I forgot my password or did not receive the reset email',
    a: (
      <>
        Select <Link component={RouterLink} to="/forgot-password">Forgot password</Link> on the login page. The email usually arrives within a few minutes; please also check your Spam or Promotions folder. If you request it several times in a row, you will need to wait a few minutes before trying again.
      </>
    ),
  },
  {
    q: 'I did not receive the verification email',
    a: 'Go to Settings → Account and choose "Resend verification". Accounts created with Google, GitHub or LinkedIn are verified automatically.',
  },
  {
    q: 'Run or Submit is failing',
    a: 'Refresh the page and try again. Compiled languages such as Java and C++ can take a few seconds. In Java, the public class must be named "Main". If it keeps failing, report it below and include the problem link and the language you used.',
  },
  {
    q: 'I paid for Pro but it is not active',
    a: (
      <>
        Wait a few seconds and refresh the page. If Pro is still not active, send a message below with the type "Payment / Pro / Store order" and include your payment ID. Refund rules: <Link component={RouterLink} to="/refund">Refund & Cancellation</Link>.
      </>
    ),
  },
  {
    q: 'How do I cancel Pro or activate a license key?',
    a: 'To cancel, go to Settings → Billing. To redeem a license key, open the profile menu and choose "Activate license". After cancelling, Pro stays active until the end of the current billing period.',
  },
  {
    q: 'I have a problem with a store order or coins',
    a: (
      <>
        <Link component={RouterLink} to="/store?tab=orders">Store → Orders</Link> shows the status of your orders. If something is wrong, send a message below with the type "Payment / Pro / Store order" and your order number.
      </>
    ),
  },
  {
    q: 'Can I download my data or delete my account?',
    a: 'Yes. Settings → Account has "Export my data" and "Delete account". If you have an active Pro subscription, cancel it first.',
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
  const [message, setMessage] = useState(errRef ? `Page error: "${errRef}"\n\nWhat I was doing: ` : '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
          Check the answers below first. If you cannot find what you need, send us a message using the form. We usually reply within 2 working days.
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

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
            <Box>
              <Typography component="h2" sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Chat with support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Talk to our team about payments, your account or technical issues. Available to signed-in users.
              </Typography>
            </Box>
            <Button variant="contained" disableElevation startIcon={<ChatRoundedIcon />} onClick={() => setChatOpen(true)} sx={{ fontWeight: 700, flexShrink: 0 }}>
              Start chat
            </Button>
          </Stack>
        </Paper>

        <Typography component="h2" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 1 }}>
          Contact us / send feedback
        </Typography>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          {sent ? (
            <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Alert severity="success" sx={{ width: '100%' }}>
                Thank you. Your message has been received. We will reply to {isAuthenticated ? 'your account email' : 'the email address you provided'}.
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
                  helperText={`${message.length}/3000. For bugs, include the problem link, language and what happened.`}
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
      <SupportChat open={chatOpen} onOpenChange={setChatOpen} />
    </Box>
  );
}
