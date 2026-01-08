export default function AssessmentsPage() {
  return (
    <div className="p-6 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Assessment History</h1>
      
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Yet</h2>
        <p className="text-gray-600">Assessment history will appear here after you complete interviews.</p>
      </div>
    </div>
  );
}
