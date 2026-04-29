import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('MISSING REDIS CONFIG: url or token is undefined');
}

const redis = new Redis({
  url: url,
  token: token,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jarData = req.body;
    const { id } = jarData;

    if (!id) {
      return res.status(400).json({ error: 'Missing jar ID' });
    }

    // Store the jar data in Redis
    await redis.set(`jar:${id}`, jarData);

    return res.status(200).json({ success: true, id });
  } catch (error) {
    console.error('Error saving jar:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
