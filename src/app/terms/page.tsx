import Header from '@/components/layout/Header'

export const metadata = {
  title: 'Terms of Service | International Escorts',
  description: 'Terms of Service for International Escorts directory.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-light text-stone-100 mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Terms of Service</h1>
        <p className="text-sm text-stone-500 mb-10">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-8 text-stone-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>1. Acceptance of Terms</h2>
            <p>By accessing or using International Escorts ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>2. Eligibility</h2>
            <p>You must be at least 18 years of age to use this Site. By using the Site, you confirm that you are 18 or older and that all persons you interact with through the Site are also 18 or older. We have zero tolerance for content involving minors.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>3. Nature of the Directory</h2>
            <p>International Escorts is an adult entertainment directory. We provide a platform for adults to connect. We are not a party to any agreements made between users. All interactions and arrangements are solely between the parties involved.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Post false, misleading or fraudulent content</li>
              <li>Harass, threaten or harm other users</li>
              <li>Post content involving minors</li>
              <li>Use the Site for illegal purposes</li>
              <li>Attempt to hack, scrape or disrupt the Site</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>5. Content</h2>
            <p>You are solely responsible for the content you post. By posting content, you grant us a non-exclusive, worldwide licence to display and distribute it on the Site. We reserve the right to remove any content that violates these terms or is otherwise objectionable.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>6. Payments & Refunds</h2>
            <p>Premium listings and agency subscriptions are non-refundable once activated. Payments are processed securely via Stripe. Prices are listed in USD.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>7. Disclaimer</h2>
            <p>The Site is provided "as is" without warranties of any kind. We do not verify the identity of all users or the accuracy of all listings. Use the Site at your own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, International Escorts shall not be liable for any indirect, incidental, special or consequential damages arising from your use of the Site.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>9. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or any other reason at our sole discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-light text-stone-100 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>10. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@internationalescorts.com" className="text-amber-500 hover:text-amber-400">support@internationalescorts.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
