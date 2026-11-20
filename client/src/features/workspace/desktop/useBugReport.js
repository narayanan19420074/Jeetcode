import { useState } from 'react';
import { useSelector } from 'react-redux';
import { feedbackApi } from '../../../api/feedbackApi';
import { extractErrorMessage } from '../../../api/apiClient';

// Same limits as the server validator (feedback.validator.js), so the form fails before the request does.
export const MAX_REPORT_LENGTH = 3000;
const MIN_REPORT_LENGTH = 10;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function validateReport(message, email, isAuthenticated) {
  if (message.trim().length < MIN_REPORT_LENGTH) return `Please describe the problem in at least ${MIN_REPORT_LENGTH} characters.`;
  // Signed-in users are answered at their account email; guests have to give one so support can reply.
  if (!isAuthenticated && !EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email so we can reply.';
  return '';
}

// State and submit logic of the "Report a bug" form. Reports go to the existing support inbox as type "bug",
// tagged with the problem page they came from so an admin can reproduce them.
export default function useBugReport(slug) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const problem = validateReport(message, email, isAuthenticated);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      await feedbackApi.submit({
        type: 'bug',
        subject: `Workspace bug: ${slug}`.slice(0, 120),
        message: message.trim(),
        pageUrl: window.location.pathname.slice(0, 300),
        ...(isAuthenticated ? {} : { email: email.trim() }),
      });
      setSent(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setMessage('');
    setError('');
    setSent(false);
  };

  return { isAuthenticated, message, setMessage, email, setEmail, busy, error, sent, submit, reset };
}
