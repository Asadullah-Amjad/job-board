import { Badge } from "@/components/ui/Badge";
import type { ApplicationStatus } from "@/types/db.types";

const tone = {
  pending: "amber",
  reviewed: "blue",
  shortlisted: "violet",
  rejected: "red",
  hired: "green",
} as const;

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge tone={tone[status]} className="capitalize">{status}</Badge>;
}
