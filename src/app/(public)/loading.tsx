import PageSkeleton from "@/components/ui/PageSkeleton";

export default function PublicLoading() {
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><PageSkeleton cards rows={6} /></div>;
}
