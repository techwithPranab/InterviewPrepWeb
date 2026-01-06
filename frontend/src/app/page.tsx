import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            AI-Powered Mock Interview Platform
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Practice interviews with AI-generated questions, get real-time feedback, 
            and boost your confidence for your next job interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-center text-sm sm:text-base"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors inline-block text-center text-sm sm:text-base"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🤖
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">AI-Generated Questions</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Get personalized interview questions based on your skills and experience level.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Real-time Feedback</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Receive instant feedback on your answers with detailed analysis and improvement suggestions.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Progress Tracking</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Track your interview performance over time and identify areas for improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
