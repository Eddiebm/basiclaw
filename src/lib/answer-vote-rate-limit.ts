import { getRedis } from "@/lib/redis-client";

const WINDOW_SEC = 3600;
const MAX_VOTES = 80;

export async function checkAnswerVoteRateLimit(actorKey: string): Promise<{ ok: boolean }> {
  const redis = getRedis();
  if (!redis) return { ok: true };
  const key = `answers:vote-rl:${actorKey}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, WINDOW_SEC);
  return { ok: n <= MAX_VOTES };
}
