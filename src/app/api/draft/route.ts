import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function draftDelete(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorised access!",
          type: "auth_error",
        },
        {
          status: 401,
        },
      );
    }
    const userId = session.user.id;

    const draftKey = `splurge:draft:${userId}`;
    await redis.del(draftKey);

    return NextResponse.json({ success: true, message: "Draft Discarded!" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: "Failed to delete draft" },
      { status: 500 },
    );
  }
}
