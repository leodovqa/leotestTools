// Simple cookie parser for serverless functions
export function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  const cookies = {};
  const pairs = cookieHeader.split(';');

  for (const pair of pairs) {
    const [name, value] = pair.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  }

  return cookies;
}
