console.log('Starting server.js...');
import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up CORS to allow requests from your Vite frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  next();
});

// Route for your /api/auth endpoint
app.get('/api/auth', async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI_API;
  if (!redirectUri) {
    if (process.env.VERCEL_URL) {
      redirectUri = `https://${process.env.VERCEL_URL}/api/auth`;
    } else {
      redirectUri = 'http://localhost:3001/api/auth';
    }
  }
  if (!code) {
    console.error('[OAuth] No code in query params');
    return res.redirect(`${frontendUrl}?auth=error`);
  }
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  console.log('[OAuth] Debug info:');
  console.log('  Client ID:', clientId ? 'Set' : 'Undefined');
  console.log('  Client Secret:', clientSecret ? 'Set' : 'Undefined');
  console.log('  Redirect URI:', redirectUri);
  console.log('  Code:', code);
  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    console.log('[OAuth] Token exchange params:', params.toString());
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[OAuth] Error exchanging code:', errorData);
      return res.redirect(`${frontendUrl}?auth=error`);
    }
    // Optionally, handle tokens here
    return res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('[OAuth] Server error:', error);
    return res.redirect(`${frontendUrl}?auth=error`);
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
