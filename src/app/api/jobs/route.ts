import { listJobs } from "@/modules/jobs/jobs.service";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const jobs = listJobs({
    q: p.get("q") ?? undefined,
    location: p.get("location") ?? undefined,
    category: p.get("category") ?? undefined,
    type: p.get("type") ?? undefined,
  });
  return Response.json({ count: jobs.length, jobs });
}
