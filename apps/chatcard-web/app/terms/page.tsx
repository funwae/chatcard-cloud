export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-cc-text mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-cc-text-muted mb-4">
            <strong>Version:</strong> 1.0<br />
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          <div className="space-y-6 text-cc-text">
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Acceptance of Terms</h2>
              <p className="text-cc-text-muted">
                By using ChatCard, you agree to these Terms of Service. If you do not agree, please do not use the service.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">User Responsibilities</h2>
              <p className="text-cc-text-muted">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Maintaining the security of your account</li>
                <li>Only creating proofs for content you own or have permission to claim</li>
                <li>Accurately representing authorship (mine, collab, remix, inspired)</li>
                <li>Complying with applicable laws and regulations</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Prohibited Uses</h2>
              <p className="text-cc-text-muted">
                You may not:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Create false or misleading proofs</li>
                <li>Claim ownership of content you did not create</li>
                <li>Use the service to harass, abuse, or harm others</li>
                <li>Attempt to circumvent rate limits or security measures</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Service Availability</h2>
              <p className="text-cc-text-muted">
                We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to modify or discontinue the service with notice.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Contact</h2>
              <p className="text-cc-text-muted">
                For questions about these terms, contact: <a href="mailto:hello@chatcard.cloud" className="text-cc-violet hover:underline">hello@chatcard.cloud</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

