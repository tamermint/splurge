import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redisURL = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

//initialize the redis instance
const redis = new Redis({
  url: redisURL,
  token: redisToken,
});

//implement rate limiter
const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.nextUrl.pathname.startsWith("/api/teaser")) {
    //identify the ip
    const headers = request.headers.get("x-forwarded-for");
    const ip = headers
      ? headers.split(",")[0]
      : request.headers.get("x-real-ip");
    const clientIp = ip || "anonymous";
    const { success, limit, remaining, reset } =
      await rateLimiter.limit(clientIp);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Whew! The Splurge Scout needs a break! Try again in an hour or sign up for Pro for unlimited access.",
        },
        {
          status: 429,
          headers: {
            "X-Ratelimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
