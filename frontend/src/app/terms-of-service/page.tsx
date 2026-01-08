import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MeritAI',
  description: 'Read our terms of service and user agreement for using MeritAI. Understand your rights and responsibilities.',
  keywords: 'terms of service, user agreement, terms and conditions, legal terms',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: October 25, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to MeritAI. These Terms of Service ("Terms") govern your use of our website, mobile application, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              MeritAI provides an AI-powered interview preparation service that helps users practice and improve their interview skills through simulated interview sessions, personalized feedback, and comprehensive interview guides. Our service includes both free and premium features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access certain features of our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Account Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these Terms or for other reasons we deem necessary to protect our Service and users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to use our Service only for lawful purposes and in accordance with these Terms. You shall not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload or transmit harmful code, viruses, or malware</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to reverse engineer or copy our AI technology</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Our Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content, features, and functionality of our Service, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 User Content</h3>
            <p className="text-gray-700 leading-relaxed">
              By submitting content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content in connection with the Service. You retain ownership of your content and are responsible for ensuring you have the right to grant us this license.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. AI Content and Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service uses artificial intelligence to generate interview questions, feedback, and responses. While we strive for accuracy and quality:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>AI-generated content may not always be perfect or comprehensive</li>
              <li>You should use our Service as a supplement to, not a replacement for, professional interview preparation</li>
              <li>We do not guarantee specific outcomes or success in actual interviews</li>
              <li>AI responses should be critically evaluated and not taken as absolute truth</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is governed by our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Payment Terms</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">8.1 Subscription Fees</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Some features of our Service require payment of fees. By subscribing to a paid plan, you agree to pay all applicable fees and charges.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">8.2 Billing and Refunds</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Payments are processed securely through our payment processors. Subscription fees are billed in advance and are non-refundable except as required by law or as specified in our refund policy.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">8.3 Price Changes</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to change subscription prices at any time. Price changes will be communicated in advance and will not affect current billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">9.1 Service Disclaimer</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">9.2 Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration or in the appropriate courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through our Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:legal@mockinterview.com" className="text-blue-600 hover:text-blue-800">legal@mockinterview.com</a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Subject:</strong> Terms of Service Inquiry
              </p>
            </div>
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
