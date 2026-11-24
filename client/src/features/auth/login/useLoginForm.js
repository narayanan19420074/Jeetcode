import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../authSlice';

// After sign in, return to the page the visitor tried to open; admins land on the side (admin console or app) they used last.
export function useRedirectAfterSignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const viewMode = useSelector((state) => state.ui.viewMode);
  return (user) => {
    const adminHome = viewMode === 'user' ? '/dashboard' : '/admin';
    const destination = location.state?.from?.pathname || (user.role === 'admin' ? adminHome : '/dashboard');
    navigate(destination, { replace: true });
  };
}

export default function useLoginForm() {
  const dispatch = useDispatch();
  const redirectAfterSignIn = useRedirectAfterSignIn();
  const { status, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password, turnstileToken: captchaToken }));
    if (loginUser.fulfilled.match(result)) {
      redirectAfterSignIn(result.payload.user);
    } else {
      captchaRef.current?.reset(); // a verification token works only once
    }
  };

  return { email, setEmail, password, setPassword, setCaptchaToken, captchaToken, captchaRef, status, error, handleSubmit };
}
