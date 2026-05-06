import Header from '@/components/layout/Header'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | International Escorts',
  description: 'Privacy Policy for International Escorts directory.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Privacy Policy</h1>
        <p className="text-sm text-stone-500 mb-10">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-invert prose-stone max-w-none space-y-8 text-stone-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>1. Introduction</h2>
            <p>International Escorts ("we", "our", "us") operates the website internationalescorts.com. This Privacy Policy explains how we collect, use, disclose and safeguard your information when you visit our website and use our services. Please read this policy carefully.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>2. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Name, email address and password when you create an account</li>
              <li>Profile information including photos, bio, location and service details</li>
              <li>Booking and messaging information</li>
              <li>Payment information (processed securely via Stripe — we do not store card details)</li>
              <li>Communications you send us</li>
            </ul>
            <p className="mt-3">We also automatically collect certain information when you use our website, including IP address, browser type, pages visited and referring URLs.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain and improve our services</li>
              <li>To process bookings and payments</li>
              <li>To send administrative notifications and updates</li>
              <li>To respond to your comments and questions</li>
              <li>To monitor and analyse usage patterns</li>
              <li>To detect and prevent fraudulent or harmful activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>4. Information Sharing</h2>
            <p>We do not sell, trade or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our website (such as hosting and payment processors), provided they agree to keep this information confidential.</p>
            <p className="mt-2">We may disclose information if required by law or to protect the rights, property or safety of our users or the public.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>5. Cookies</h2>
            <p>We use cookies and similar tracking technologies to maintain your session and improve your experience. You can disable cookies in your browser settings, though some features may not function properly.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>6. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide our services. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>7. Your Rights</h2>
            <p>You have the right to access, correct or delete your personal data. To exercise these rights, please contact us at <a href="mailto:support@internationalescorts.com" className="text-amber-500 hover:text-amber-400">support@internationalescorts.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>8. Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@internationalescorts.com" className="text-amber-500 hover:text-amber-400">support@internationalescorts.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
