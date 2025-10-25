export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <div>
          &copy; {new Date().getFullYear()} Mock Interview Platform. All rights reserved.
        </div>
        <div>
          Contact: <a href="mailto:support@mockinterview.com" className="text-blue-600 hover:underline">support@mockinterview.com</a>
        </div>
      </div>
    </footer>
  );
}
