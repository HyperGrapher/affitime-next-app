import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div className="mx-auto max-w-6xl px-4 py-20"><Skeleton className="h-12 w-80" /><Skeleton className="mt-6 h-64" /></div>;
}
