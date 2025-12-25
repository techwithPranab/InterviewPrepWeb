export default function ScheduledInterviewsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📅 Scheduled Interviews</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder content */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Scheduled Interviews</h2>
          <p className="text-gray-600 mb-4">You don't have any scheduled interviews at the moment.</p>
          <a href="/interview/new" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Schedule an Interview
          </a>
        </div>
      </div>
    </div>
  );
}
