import PageSkeleton from "@/components/ui/PageSkeleton";

export default function AdminLoading() {
  return <div className="p-6"><PageSkeleton rows={7} /></div>;
}
