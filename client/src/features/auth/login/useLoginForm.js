import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../authSlice';

// After sign in, return to the page the visitor tried to open; admins land in the admin area.
export function useRedirectAfterSignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  return (user) => {
    const destination = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard');
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
