'use client';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-cc-text mb-8">Settings</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Privacy</h2>
            <p className="text-cc-text-muted mb-4">
              Configure your privacy settings and visibility preferences.
            </p>
            {/* TODO: Privacy settings UI */}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Proofs</h2>
            <p className="text-cc-text-muted mb-4">
              Manage your ownership proofs and verification settings.
            </p>
            {/* TODO: Proofs management UI */}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Connectors</h2>
            <p className="text-cc-text-muted mb-4">
              Connect external services to automatically propose items to your Card.
            </p>
            {/* TODO: Connectors UI */}
          </section>
        </div>
      </div>
    </div>
  );
}

