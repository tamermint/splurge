import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(): Promise<NextResponse> {
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
    const data = await redis.get(draftKey);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const status = 500;
    const type = "system_error";
    const message = "An unexpected error occurred";
    console.error(error);
    return NextResponse.json(
      { success: false, error: message, type },
      { status },
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
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
    const status = 500;
    const type = "system_error";
    const message = "An unexpected error occurred";
    console.error(error);
    return NextResponse.json(
      { success: false, error: message, type },
      { status },
    );
  }
}
