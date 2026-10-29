import { listJobsPage } from "@/modules/jobs/jobs.service";
import { apiError } from "@/lib/errors";
import { parsePage } from "@/lib/utils/pagination";

export async function GET(req: Request) {
  try {
    const p = new URL(req.url).searchParams;
    const page = await listJobsPage({
      q: p.get("q") ?? undefined,
      location: p.get("location") ?? undefined,
      locationRegion: p.get("locationRegion") ?? undefined,
      category: p.get("category") ?? undefined,
      type: p.get("type") ?? undefined,
      page: parsePage(p.get("page") ?? undefined),
      pageSize: 12,
    });
    return Response.json({ success: true, data: page, error: null, code: null });
  } catch (error) {
    return apiError(error, "Jobs are temporarily unavailable. Please try again.");
  }
}
