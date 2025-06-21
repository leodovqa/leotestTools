import { parseCookies } from '../utils/cookies.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get user from cookie (stateless approach for serverless)
  const cookies = parseCookies(req.headers.cookie);
  const userCookie = cookies.user;

  if (!userCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let user;
  try {
    user = JSON.parse(userCookie);
  } catch {
    return res.status(401).json({ error: 'Invalid user data' });
  }

  if (!user.access_token) {
    return res.status(401).json({ error: 'No access token' });
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
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
