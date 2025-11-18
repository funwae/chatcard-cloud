import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChatAssistantPanel } from '@/components/ChatAssistantPanel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChatCard Examples – Integration & UX Patterns',
  description: 'Example integrations and UX patterns for the ChatCard portable AI identity standard.',
}

export default function ExamplesPage() {
  return (
    <>
      <Header />
      <main className="cc-main">
        {/* Intro */}
        <section className="cc-section bg-cc-surface">
          <div className="cc-section-inner">
            <p className="text-xs uppercase tracking-wider text-cc-text-muted mb-4 font-mono">
              EXAMPLES
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-cc-text">Integration &amp; UX examples</h1>
            <p className="text-lg md:text-xl text-cc-text-muted max-w-3xl">
              This page shows how a few different products could integrate ChatCard, both at the protocol level and in the user
              interface. Use these as patterns, not rules.
            </p>
          </div>
        </section>

        {/* Example 1: Documentation site */}
        <section className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">1. AI-enabled documentation site</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              A developer docs site wants to offer ChatCard-aware AI helpers for reading, explaining, and drafting code snippets,
              without silently acting on behalf of the user.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-cc-text">Scopes &amp; behavior</h3>
                <ul className="space-y-3 text-cc-text-muted list-disc list-inside">
                  <li>Requested levels: <code className="cc-code-inline">read</code> and <code className="cc-code-inline">suggest</code> only.</li>
                  <li>The AI can:
                    <ul className="ml-4 mt-2 space-y-2">
                      <li>Read page content and metadata.</li>
                      <li>Explain concepts in the user&apos;s preferred language and tone.</li>
                      <li>Draft code samples or queries, but never run them.</li>
                    </ul>
                  </li>
                </ul>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-cc-text">UI pattern</h3>
                <ul className="space-y-3 text-cc-text-muted list-disc list-inside">
                  <li>A &ldquo;Connect ChatCard&rdquo; button at the top of the page or in the AI assistant panel.</li>
                  <li>After connection, a small card indicator: &ldquo;Using your ChatCard persona (EN, casual).&rdquo;</li>
                  <li>Suggestions appear with clear &ldquo;Insert&rdquo; / &ldquo;Copy&rdquo; buttons.</li>
                </ul>
              </article>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-cc-text">Sample client-side logic (pseudo-code)</h3>
            <pre className="cc-code-block"><code>{`// Detect ChatCard support and request a connection
if (window.chatcard && window.chatcard.isAvailable()) {
  const connectBtn = document.getElementById("connect-chatcard");
  connectBtn.addEventListener("click", async () => {
    const token = await window.chatcard.requestConnection({
      scopes: ["read", "suggest"],
      rpId: "https://docs.example.com"
    });
    // Store token and use it to configure your AI client
    if (token) {
      const profile = decodeJwt(token);
      setupAIAssistant({
        persona: profile.persona,
        permissions: profile.permissions
      });
    }
  });
}`}</code></pre>

            {/* Live Demo */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-cc-text">Live demo</h3>
              <p className="text-cc-text-muted mb-4">
                Try connecting your ChatCard to this example documentation site:
              </p>
              <ChatAssistantPanel
                rpId="https://docs.example.com"
                requestedScopes={['read', 'suggest']}
              />
            </div>
          </div>
        </section>

        {/* Example 2: Productivity app */}
        <section className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">2. Productivity app with suggested actions</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              A productivity app uses ChatCard to let the user&apos;s AI draft tasks, reorganize lists, and propose shortcuts, but only
              executes actions after explicit confirmation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-cc-text">Scopes &amp; behavior</h3>
                <ul className="space-y-3 text-cc-text-muted list-disc list-inside">
                  <li>Requested levels: <code className="cc-code-inline">read</code>, <code className="cc-code-inline">suggest</code>, <code className="cc-code-inline">act_with_confirmation</code>.</li>
                  <li>The AI can:
                    <ul className="ml-4 mt-2 space-y-2">
                      <li>Read tasks, project names, and deadlines.</li>
                      <li>Propose batch edits (e.g., &ldquo;move all overdue tasks to Today&rdquo;).</li>
                      <li>Execute edits, but only after user confirmation.</li>
                    </ul>
                  </li>
                </ul>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-cc-text">Confirmation pattern</h3>
                <ul className="space-y-3 text-cc-text-muted list-disc list-inside">
                  <li>AI suggests an action: &ldquo;Move 12 tasks to Today based on your preferences.&rdquo;</li>
                  <li>User sees a summary of changes and an &ldquo;Approve&rdquo; button.</li>
                  <li>Only after approval does the app apply changes via its normal backend logic.</li>
                </ul>
              </article>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-cc-text">Example: AI action request (server-side)</h3>
            <pre className="cc-code-block"><code>{`// Pseudo-code for an API endpoint that uses ChatCard token
app.post("/ai/suggest-actions", async (req, res) => {
  const token = extractChatCardToken(req);
  const profile = verifyAndDecodeToken(token); // checks signature, expiry, issuer
  
  if (!profile.permissions || !profile.permissions.site_grants["https://tasks.example.com"]) {
    return res.status(403).json({ error: "ChatCard not authorized for this site" });
  }
  
  const allowedScopes = profile.permissions.site_grants["https://tasks.example.com"];
  if (!allowedScopes.includes("act_with_confirmation")) {
    return res.status(403).json({ error: "Missing act_with_confirmation scope" });
  }
  
  // Use persona + preferences to tune the AI request
  const result = await callYourModel({
    persona: profile.persona,
    tasks: await getUserTasks(req.userId)
  });
  
  res.json({
    suggestion: result.suggestion,
    diffPreview: result.diffPreview
  });
});`}</code></pre>
          </div>
        </section>

        {/* Example 3: EarthCloud-style integration */}
        <section className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">3. EarthCloud-style intent &amp; trails integration</h2>
            <p className="text-lg text-cc-text-muted mb-8 max-w-3xl">
              A more advanced integration uses ChatCard alongside an EarthCloud-like intent/trails layer. ChatCard expresses who the
              AI is acting for; EarthCloud expresses what the AI is doing and why.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-cc-text">Combined model</h3>
                <p className="text-cc-text-muted mb-3">The RP ties these pieces together:</p>
                <ul className="space-y-2 text-cc-text-muted list-disc list-inside">
                  <li>ChatCard token → persona, scopes, privacy preferences.</li>
                  <li>EarthCloud → GlyphIR blocks (intent, tone, register, metadata).</li>
                  <li>Tongbuku (or similar) → trails of interactions.</li>
                </ul>
              </article>
              <article className="cc-card p-6">
                <h3 className="text-xl font-semibold mb-4 text-cc-text">Benefits</h3>
                <ul className="space-y-2 text-cc-text-muted list-disc list-inside">
                  <li>Clear separation of &ldquo;who&rdquo; (ChatCard) from &ldquo;what&rdquo; (intent) and &ldquo;how&rdquo; (trails).</li>
                  <li>Easier auditing: you can replay what an AI did for which card and why.</li>
                  <li>Future-proofing for richer standards around AI-enabled content.</li>
                </ul>
              </article>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-cc-text">Trail event shape (illustrative)</h3>
            <pre className="cc-code-block"><code>{`{
  "event_id": "evt_01JK...",
  "timestamp": "2025-11-08T20:15:00Z",
  "card_id": "card_01HX9ZK0ABCDEF",
  "rp_id": "https://app.example.com",
  "intent": {
    "type": "reorganize_tasks",
    "source": "earthcloud_glyphir_block_id"
  },
  "action": {
    "proposed": {
      "move_tasks": ["task_1", "task_2"],
      "new_list": "Today"
    },
    "status": "pending_user_confirmation"
  }
}`}</code></pre>
          </div>
        </section>

        {/* Design patterns */}
        <section className="cc-section">
          <div className="cc-section-inner">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-cc-text">UX design patterns</h2>
            <p className="text-lg text-cc-text-muted mb-6 max-w-3xl">Some UI patterns that tend to work well with ChatCard:</p>
            <ul className="space-y-4 text-cc-text-muted max-w-3xl list-disc list-inside">
              <li><strong className="text-cc-text">Card indicator:</strong> a small badge showing which persona is active (&ldquo;Using your ChatCard persona&rdquo;).</li>
              <li><strong className="text-cc-text">Scope clarity:</strong> show current scope level (&ldquo;Read-only&rdquo;, &ldquo;Suggest&rdquo;, etc.) near the AI UI.</li>
              <li><strong className="text-cc-text">History transparency:</strong> a simple view where users can see &ldquo;What my AI did here&rdquo; per site.</li>
              <li><strong className="text-cc-text">Easy disconnect:</strong> a clearly visible way to revoke ChatCard from a site.</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

