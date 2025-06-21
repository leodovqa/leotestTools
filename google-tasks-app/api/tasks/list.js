import { parseCookies } from '../utils/cookies.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
