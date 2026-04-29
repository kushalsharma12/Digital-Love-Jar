import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing jar ID' });
  }

  try {
    const data = await redis.get(`jar:${id}`);

    if (!data) {
      return res.status(404).json({ error: 'Jar not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching jar:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
