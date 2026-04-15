import "dotenv/config";
import { Redis } from "@upstash/redis";

const redisURL = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

//initialize the redis instance
const redis = new Redis({
  url: redisURL,
  token: redisToken,
});

// string
await redis.set("key", "value");
let data = await redis.get("key");
console.log(data);

await redis.set("key2", "value2", { ex: 1 });

// sorted set
await redis.zadd("scores", { score: 1, member: "team1" });
data = await redis.zrange("scores", 0, 100);
console.log(data);

// list
await redis.lpush("elements", "magnesium");
data = await redis.lrange("elements", 0, 100);
console.log(data);

// hash
await redis.hset("people", { name: "joe" });
data = await redis.hget("people", "name");
console.log(data);

// sets
await redis.sadd("animals", "cat");
data = await redis.spop("animals", 1);
console.log(data);
