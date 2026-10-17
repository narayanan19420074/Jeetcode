import { useEffect, useState } from 'react';
import { contestApi } from '../../api/contestApi';

export const inr = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;

export const fmtStart = (iso) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) + ' IST';

export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

export const fmtDuration = (min) => (min % 60 === 0 ? `${min / 60} hours` : `${Math.floor(min / 60)}h ${min % 60}m`);

// Loads the contest once. `contest` is null while loading and `false` if it could not be loaded.
export function useContest() {
  const [contest, setContest] = useState(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    contestApi
      .get()
      .then(({ data }) => !cancelled && setContest(data.data))
      .catch(() => !cancelled && setContest(false));
    return () => { cancelled = true; };
  }, [version]);
  return { contest, setContest, reload: () => setVersion((v) => v + 1) };
}

// Ticking countdown to `targetIso`, measured against the SERVER clock (a wrong phone clock can't change it).
export function useCountdown(targetIso, serverTimeIso) {
  const [now, setNow] = useState(() => Date.now());
  const [offset] = useState(() => (serverTimeIso ? Date.parse(serverTimeIso) - Date.now() : 0));
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, Date.parse(targetIso) - (now + offset));
  const s = Math.floor(ms / 1000);
  return { ms, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
