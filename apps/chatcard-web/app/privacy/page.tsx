export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-cc-text mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-cc-text-muted mb-4">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          <div className="space-y-6 text-cc-text">
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Data We Collect</h2>
              <p className="text-cc-text-muted">
                ChatCard collects minimal data necessary to provide the service:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Email address (for authentication)</li>
                <li>Handle and DID (decentralized identifier)</li>
                <li>Proof documents you create</li>
                <li>Card items you add to your profile</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">How We Use Your Data</h2>
              <p className="text-cc-text-muted">
                Your data is used solely to provide the ChatCard service. We do not sell or share your data with third parties.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Your Rights</h2>
              <p className="text-cc-text-muted">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Export your data at any time</li>
                <li>Delete your account and all associated data</li>
                <li>Control the visibility of your card items</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Contact</h2>
              <p className="text-cc-text-muted">
                For privacy concerns, contact: <a href="mailto:hello@chatcard.cloud" className="text-cc-violet hover:underline">hello@chatcard.cloud</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

