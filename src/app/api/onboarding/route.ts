import { ValidationError } from "@/lib/errors";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { intializeUserWithFiancials } from "@/services/data/onboardingService";
import { OnboardingPayloadSchema } from "@/domain/types/forecast";
import { z } from "zod";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access",
          type: "auth_error",
        },
        { status: 401 },
      );
    }
    const userId: string = session.user.id;
    const input = await request.json();
    const validationResult = OnboardingPayloadSchema.safeParse(input);
    if (!validationResult.success) {
      const formattedErrors = z.prettifyError(validationResult.error);
      throw new ValidationError(`Validation failed: ${formattedErrors}`);
    }
    const onboardingPayload = validationResult.data;
    const updatedUser = await intializeUserWithFiancials(
      userId,
      onboardingPayload,
    );
    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    let status = 500;
    let type = "system_error";
    let message = "An unexpected error occured";
    if (error instanceof ValidationError) {
      status = 400;
      type = "validation_error";
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { success: false, error: message, type },
      { status },
    );
  }
}
