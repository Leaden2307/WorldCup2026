import { getStore } from '@netlify/blobs';

export default async (req) => {
  const store = getStore('keepy-leaderboard');
  const KEY = 'scores';
  if (req.method === 'POST') {
    let body = {};
    try { body = await req.json(); } catch (e) {}
    const name = (String(body.name || 'Anon').replace(/[<>]/g, '').trim().slice(0, 20)) || 'Anon';
    const score = Math.max(0, Math.min(99999, parseInt(body.score, 10) || 0));
    let list = (await store.get(KEY, { type: 'json' })) || [];
    list.push({ name, score, at: Date.now() });
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, 30);
    await store.setJSON(KEY, list);
    return Response.json(list.slice(0, 3));
  }
  const list = (await store.get(KEY, { type: 'json' })) || [];
  return Response.json(list.slice(0, 3));
};
