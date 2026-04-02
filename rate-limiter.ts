import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisURL = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = new Redis({
  url: redisURL,
  token: redisToken,
});
await redis.set("foo", "bar");
let data = await redis.get("foo");
console.log(data);
