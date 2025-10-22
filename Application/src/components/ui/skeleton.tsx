interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function DocumentSkeleton() {
  return (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center space-x-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-3 w-20" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UploadSkeleton() {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 space-y-4">
      <Skeleton className="w-12 h-12 mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
      <Skeleton className="h-3 w-32 mx-auto" />
    </div>
  );
}
