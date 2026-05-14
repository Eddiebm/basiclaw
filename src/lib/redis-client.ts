import { Redis } from "@upstash/redis";

let redisClient: Redis | null | undefined;
let loggedMissingRedis = false;

export function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    redisClient = new Redis({ url, token });
  } else {
    if (!loggedMissingRedis) {
      loggedMissingRedis = true;
      console.warn(
        "[basiclaw] Redis disabled: set KV_REST_API_URL and KV_REST_API_TOKEN (Vercel Marketplace KV / Upstash REST)."
      );
    }
    redisClient = null;
  }
  return redisClient;
}
