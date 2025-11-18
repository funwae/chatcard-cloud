export default function AUPage() {
  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-cc-text mb-8">Acceptable Use Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-cc-text-muted mb-4">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          <div className="space-y-6 text-cc-text">
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Allowed Uses</h2>
              <p className="text-cc-text-muted">
                ChatCard data may be used for:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Summarizing user profiles and work</li>
                <li>Answering questions about user capabilities and creations</li>
                <li>Generating link previews with attribution</li>
                <li>Attribution and credit purposes</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Disallowed Uses</h2>
              <p className="text-cc-text-muted">
                ChatCard data may NOT be used for:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Training AI models without explicit consent</li>
                <li>Commercial use without proper attribution</li>
                <li>Creating derivative works that misrepresent authorship</li>
                <li>Spam or unsolicited communications</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Rate Limits</h2>
              <p className="text-cc-text-muted">
                To ensure fair usage, rate limits apply:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>200 requests per agent per day</li>
                <li>Additional limits may apply to specific endpoints</li>
                <li>Rate limit headers are included in responses</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Violations</h2>
              <p className="text-cc-text-muted">
                Violations of this policy may result in:
              </p>
              <ul className="list-disc list-inside text-cc-text-muted space-y-2 ml-4">
                <li>Rate limit restrictions</li>
                <li>Temporary or permanent access suspension</li>
                <li>Legal action if applicable</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-cc-text mb-4">Reporting Abuse</h2>
              <p className="text-cc-text-muted">
                Report violations to: <a href="mailto:abuse@chatcard.cloud" className="text-cc-violet hover:underline">abuse@chatcard.cloud</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

