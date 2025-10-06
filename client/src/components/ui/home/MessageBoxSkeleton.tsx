export default function MessageBoxSkeleton() {
    return (
        <div className="w-[700px] animate-pulse">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                {/* Header skeleton */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                
                {/* Content skeleton */}
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                
                {/* Image grid skeleton */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[200px] bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
