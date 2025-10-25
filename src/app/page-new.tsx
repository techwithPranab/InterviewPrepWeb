import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Mock Interview Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice interviews with AI-generated questions, get real-time feedback, 
            and boost your confidence for your next job interview.
          </p>
          <div className="space-x-4">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border border-blue-600 hover:bg-blue-50 transition-colors inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              🤖
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Generated Questions</h3>
            <p className="text-gray-600">
              Get personalized interview questions based on your skills and experience level.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              🎯
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Feedback</h3>
            <p className="text-gray-600">
              Receive instant feedback on your answers with detailed analysis and improvement suggestions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
            <p className="text-gray-600">
              Track your interview performance over time and identify areas for improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
