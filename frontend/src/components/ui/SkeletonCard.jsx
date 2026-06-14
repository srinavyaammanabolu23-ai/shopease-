const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
    <div className="p-3 space-y-2.5">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
        ))}
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
    <div className="px-3 pb-3">
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  </div>
)

export default SkeletonCard
