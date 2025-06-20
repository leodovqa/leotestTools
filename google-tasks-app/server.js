console.log('Starting server.js...');
import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import session from 'express-session';

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
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Add express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true in production with HTTPS
  })
);

// Route for your /api/auth endpoint
app.get('/api/auth', async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  let redirectUri =
    process.env.VITE_GOOGLE_REDIRECT_URI_API || process.env.VITE_GOOGLE_REDIRECT_URI;
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
  console.log('  Redirect URI:', redirectUri ? 'Set' : 'Undefined');
  console.log('  Code:', code);
  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    console.log('[OAuth] Token exchange params:', params.toString() ? 'Set' : 'Undefined');
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
    const data = await response.json();
    // Fetch user profile info from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });
    const profile = await profileRes.json();
    // Store token data and profile in session
    req.session.user = {
      ...data,
      profile, // contains name, email, picture, etc.
      expires_at: Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600 * 1000),
    };
    return res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('[OAuth] Server error:', error);
    return res.redirect(`${frontendUrl}?auth=error`);
  }
});

// Endpoint to get current session user
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Endpoint to logout (destroy session)
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Endpoint to create a new Google Task
app.post('/api/tasks/create', async (req, res) => {
  const user = req.session.user;
  if (!user || !user.access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { title, notes, due } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  try {
    // 1. Get the user's default tasklist
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });
    if (!listRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch task lists' });
    }
    const lists = await listRes.json();
    const defaultList = lists.items && lists.items[0];
    if (!defaultList) {
      return res.status(500).json({ error: 'No task list found' });
    }
    // 2. Create the task
    const taskBody = { title };
    if (notes) taskBody.notes = notes;
    if (due) taskBody.due = new Date(due).toISOString(); // Google API expects RFC3339
    const createRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskBody),
      }
    );
    if (!createRes.ok) {
      const err = await createRes.json();
      return res.status(500).json({ error: 'Failed to create task', details: err });
    }
    const createdTask = await createRes.json();
    return res.status(200).json({ task: createdTask });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Endpoint to list Google Tasks
app.get('/api/tasks/list', async (req, res) => {
  const user = req.session.user;
  if (!user || !user.access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    // 1. Get the user's default tasklist
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });
    if (!listRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch task lists' });
    }
    const lists = await listRes.json();
    const defaultList = lists.items && lists.items[0];
    if (!defaultList) {
      return res.status(500).json({ error: 'No task list found' });
    }
    // 2. Get the tasks in the default list
    const tasksRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks?showCompleted=true&showHidden=true`,
      {
        headers: { Authorization: `Bearer ${user.access_token}` },
      }
    );
    if (!tasksRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    const tasksData = await tasksRes.json();
    // Return only relevant fields
    const tasks = (tasksData.items || []).map((t) => ({
      id: t.id,
      title: t.title,
      notes: t.notes,
      due: t.due,
      status: t.status,
      completed: t.completed,
    }));
    return res.status(200).json({ tasks });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Endpoint to update a Google Task's status (complete/un-complete)
app.post('/api/tasks/update-status', async (req, res) => {
  const user = req.session.user;
  if (!user || !user.access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'Task id and status are required' });
  }
  try {
    // 1. Get the user's default tasklist
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${user.access_token}` },
    });
    if (!listRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch task lists' });
    }
    const lists = await listRes.json();
    const defaultList = lists.items && lists.items[0];
    if (!defaultList) {
      return res.status(500).json({ error: 'No task list found' });
    }
    // 2. Update the task status
    const updateRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${defaultList.id}/tasks/${id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );
    if (!updateRes.ok) {
      const err = await updateRes.json();
      return res.status(500).json({ error: 'Failed to update task', details: err });
    }
    const updatedTask = await updateRes.json();
    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
