import { parseCookies } from './utils/cookies.js';

export default function handler(req, res) {
  // For demo: check for a user token in a cookie (replace with real logic)
  const cookies = parseCookies(req.headers.cookie);
  const userCookie = cookies.user;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      return res.status(200).json({ user });
    } catch {
      return res.status(401).json({ user: null });
    }
  } else {
    return res.status(401).json({ user: null });
  }
}
