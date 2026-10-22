import PageSkeleton from "@/components/ui/PageSkeleton";

export default function AuthLoading() {
  return <div className="mx-auto max-w-md px-4 py-12"><PageSkeleton rows={4} /></div>;
}
