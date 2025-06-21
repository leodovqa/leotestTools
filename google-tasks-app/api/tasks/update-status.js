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
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
