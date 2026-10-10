// Tiny user-agent summariser for the Sessions page ("Chrome on Windows").
// Not a full parser — just enough to let people recognise their own devices.
export function describeUserAgent(ua = '') {
  if (!ua) return { browser: 'Unknown browser', os: 'Unknown OS', label: 'Unknown device', mobile: false };
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : /curl|node|axios|python/i.test(ua) ? 'API client'
    : 'Browser';
  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown OS';
  return { browser, os, label: `${browser} on ${os}`, mobile: /Android|iPhone|iPad|Mobile/.test(ua) };
}
