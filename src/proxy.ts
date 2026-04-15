import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { auth } from "@/lib/auth";

const redisURL = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

//initialize the redis instance
const redis = new Redis({
  url: redisURL,
  token: redisToken,
});

//implement rate limiter
const rateLimiter = {
  anonymous: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "@upstash/ratelimit",
    analytics: true,
  }),
  pro: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "@upstash/ratelimit",
    analytics: true,
  }),
};

function buildRateLimitResponse(
  limit: number,
  remaining: number,
  reset: number,
  message: string,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const session = await auth();
  let userId = session?.user?.id;
  let userPlan = "FREE";
  if (userId) {
    userPlan = (session?.user as any).plan;
  }
  const identifier = userId ?? ipAddress(request) ?? "anonymous";
  if (!userId) {
    if (
      pathname.startsWith("/api/forecast") ||
      pathname.startsWith("/api/insights")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required!",
        },
        {
          status: 401,
        },
      );
    }
    if (pathname.startsWith("/api/teaser")) {
      const { success, limit, remaining, reset } =
        await rateLimiter.anonymous.limit(identifier);

      if (!success) {
        const message = "Anonymous user throttled";
        buildRateLimitResponse(limit, remaining, reset, message);
      } else return NextResponse.next();
    }
  }
  if (userId && userPlan !== "PRO") {
    if (pathname.startsWith("/api/insights")) {
      return NextResponse.json(
        {
          success: false,
          error: "Pro membership required",
        },
        {
          status: 429,
          headers: {
            "X-downgrade": "teaser",
          },
        },
      );
    }
    if (
      pathname.startsWith("/api/teaser") ||
      pathname.startsWith("/api/forecast")
    ) {
      const { success, limit, remaining, reset } =
        await rateLimiter.anonymous.limit(identifier);
      if (!success) {
        const message = "Unlock higher limits with pro membership!";
        buildRateLimitResponse(limit, remaining, reset, message);
      } else return NextResponse.next();
    }
  }
  const { success } = await rateLimiter.pro.limit(identifier);
  if (!success) {
    const response = NextResponse.next();
    response.headers.set("X-splurge-ai-throttle", "true");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/forecast/:path*",
    "/api/insights/:path*",
    "/api/teaser/:path*",
  ],
};
