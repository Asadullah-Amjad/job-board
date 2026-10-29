import { getCurrentUser } from "@/lib/auth/session";
import { listApplicationsPage } from "@/modules/applications/applications.service";
import { apiError, AppError } from "@/lib/errors";
import { parsePage } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Please sign in to continue.");
    if (user.role !== "admin") throw new AppError("FORBIDDEN", "You do not have permission to view applications.");
    const params = new URL(request.url).searchParams;
    const status = params.get("status") || undefined;
    const category = params.get("category") || undefined;
    const q = params.get("q") || undefined;
    const page = await listApplicationsPage({ status, category, q, page: parsePage(params.get("page") || undefined), pageSize: 10 });
    return Response.json({ success: true, data: page, error: null, code: null });
  } catch (error) {
    return apiError(error, "Applications are temporarily unavailable. Please try again.");
  }
}
