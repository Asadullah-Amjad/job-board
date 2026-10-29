import { getCurrentUser } from "@/lib/auth/session";
import { AppError, apiError } from "@/lib/errors";
import { listCategories, listJobsPage } from "@/modules/jobs/jobs.service";
import { parsePage } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Please sign in to continue.");
    if (user.role !== "admin") throw new AppError("FORBIDDEN", "You do not have permission to view jobs.");

    const params = new URL(request.url).searchParams;
    const [page, categories] = await Promise.all([
      listJobsPage({
        includeClosed: true,
        admin: true,
        page: parsePage(params.get("page") || undefined),
        pageSize: 10,
        q: params.get("q") || undefined,
        category: params.get("category") || undefined,
        status: params.get("status") === "open" || params.get("status") === "closed" ? params.get("status") as "open" | "closed" : undefined,
        sort: params.get("sort") === "title" ? "title" : "created_at",
        direction: params.get("direction") === "asc" ? "asc" : "desc",
      }),
      listCategories(),
    ]);
    return Response.json({ success: true, data: { page, categories }, error: null, code: null });
  } catch (error) {
    return apiError(error, "Jobs are temporarily unavailable. Please try again.");
  }
}
