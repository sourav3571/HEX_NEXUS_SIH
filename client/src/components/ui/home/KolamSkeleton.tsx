export default function KolamSkeleton() {
    return (
        <div className="w-[400px] animate-pulse">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                {/* Header skeleton */}
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-6"></div>
                
                {/* SVG placeholder */}
                <div className="w-full rounded-lg border border-gray-200 bg-gray-100 p-8">
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                
                {/* Metrics skeleton */}
                <div className="mt-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                
                {/* Button skeleton */}
                <div className="mt-6 h-10 bg-gray-200 rounded-lg w-64"></div>
            </div>
        </div>
    );
}
