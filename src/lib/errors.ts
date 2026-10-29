export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "EMAIL_DELIVERY_FAILED"
  | "DATABASE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status = statusFor(code),
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

function statusFor(code: AppErrorCode) {
  switch (code) {
    case "VALIDATION_ERROR": return 400;
    case "UNAUTHENTICATED": return 401;
    case "FORBIDDEN": return 403;
    case "NOT_FOUND": return 404;
    case "CONFLICT": return 409;
    case "RATE_LIMITED": return 429;
    default: return 500;
  }
}

export function publicMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof AppError) return error.message;
  console.error("[application-error]", error);
  return fallback;
}

export function apiError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof AppError) {
    return Response.json(
      { success: false, data: null, error: error.message, code: error.code },
      { status: error.status }
    );
  }
  console.error("[api-error]", error);
  return Response.json(
    { success: false, data: null, error: fallback, code: "INTERNAL_ERROR" },
    { status: 500 }
  );
}

export function isMissingSchemaError(error: { code?: string; message?: string } | null | undefined) {
  return error?.code === "PGRST205" || error?.message?.includes("schema cache") || error?.message?.includes("does not exist");
}
