import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | MeritAI',
  description: 'Understand how MeritAI uses cookies and tracking technologies. Learn about your cookie preferences and privacy choices.',
  keywords: 'cookie policy, cookies, tracking, privacy, data collection',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600">Last updated: October 25, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies for several purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our platform</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Essential Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies are necessary for our website to function and cannot be disabled. They include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Authentication cookies to keep you logged in</li>
              <li>Security cookies to protect your account</li>
              <li>Session cookies that expire when you close your browser</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Analytics Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use analytics cookies to understand how our platform is used and to improve user experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Google Analytics - tracks page views and user interactions</li>
              <li>Usage patterns and feature adoption metrics</li>
              <li>Performance monitoring and error tracking</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Functional Cookies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              These cookies remember your preferences and enhance your experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Language and region preferences</li>
              <li>Theme settings (light/dark mode)</li>
              <li>Form data preservation</li>
              <li>Custom dashboard layouts</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.4 Marketing Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              We may use marketing cookies to show relevant advertisements and measure campaign effectiveness. These cookies track your browsing behavior across websites to deliver personalized content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Some cookies are set by third-party services that appear on our pages. We have no control over these cookies, and they are subject to the respective third party's privacy policy:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Google Analytics:</strong> Used for website analytics and performance monitoring</li>
              <li><strong>Social Media Platforms:</strong> Enable social sharing and login options</li>
              <li><strong>Payment Processors:</strong> Secure payment processing for premium features</li>
              <li><strong>Customer Support:</strong> Live chat and support ticket systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Management</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Browser Settings</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Clear all cookies when you close the browser</li>
              <li>Receive notifications when cookies are set</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Our Cookie Preferences</h3>
            <p className="text-gray-700 leading-relaxed">
              You can manage your cookie preferences directly on our platform through the cookie consent banner or settings panel. Non-essential cookies will only be set with your consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Impact of Disabling Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Please note that disabling certain cookies may affect your experience on our platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Essential cookies cannot be disabled as they are required for basic functionality</li>
              <li>Disabling analytics cookies will prevent us from improving our service</li>
              <li>Functional cookies enhance your experience but are not essential</li>
              <li>Some features may not work properly without certain cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies have different lifespans depending on their purpose:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain until deleted or expired (typically 30 days to 2 years)</li>
              <li><strong>Analytics Data:</strong> Retained according to our data retention policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any significant changes and update the "Last updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Your Consent</h2>
            <p className="text-gray-700 leading-relaxed">
              By using our platform, you consent to the use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings or contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:cookies@mockinterview.com" className="text-blue-600 hover:text-blue-800">cookies@mockinterview.com</a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Subject:</strong> Cookie Policy Inquiry
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Related Policies</h2>
            <p className="text-gray-700 leading-relaxed">
              For more information about how we handle your data, please review our:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-blue-600 hover:text-blue-800">Terms of Service</Link></li>
            </ul>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
