export default function FindInterviewsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Find Interviews</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder content */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Interviews</h2>
          <p className="text-gray-600 mb-4">Browse and find available interview opportunities.</p>
          <a href="/interview-guides" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Browse Interview Guides
          </a>
        </div>
      </div>
    </div>
  );
}
