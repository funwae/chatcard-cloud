'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type VibeEnergy = 'low' | 'medium' | 'high';

interface VibeProfile {
  label?: string;
  tone: string[];
  values: string[];
  workStyle: string[];
  conflictStyle: string;
  energy?: VibeEnergy;
  notes?: string;
}

interface VibeRoom {
  id: string;
  name: string;
  problem: string;
  vibe: VibeProfile;
  dealbreakers?: string[];
  metadata?: {
    creatorDid?: string;
    createdAt?: string;
    status?: 'active' | 'archived' | 'dissolved';
  };
}

function splitList(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildVibeRoom(
  roomName: string,
  problem: string,
  tone: string,
  values: string,
  workStyle: string,
  conflictStyle: string,
  energy: VibeEnergy,
  dealbreakers: string,
): VibeRoom {
  const name = roomName || 'Untitled Vibe Tribe';
  const id =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'vibe-tribe';

  const vibe: VibeProfile = {
    label: name,
    tone: splitList(tone),
    values: splitList(values),
    workStyle: splitList(workStyle),
    conflictStyle: conflictStyle || 'gentle-direct',
    energy,
  };

  const room: VibeRoom = {
    id,
    name,
    problem: problem || 'Describe the mission for this Vibe Tribe.',
    vibe,
    dealbreakers: splitList(dealbreakers),
    metadata: {
      createdAt: new Date().toISOString(),
      status: 'active',
    },
  };

  return room;
}

function buildManifesto(room: VibeRoom): string {
  const tone = room.vibe.tone.join(', ') || 'unspecified tone';
  const values = room.vibe.values.join(', ') || 'implicit values';
  const work = room.vibe.workStyle.join(', ') || 'flexible working styles';
  const deal = room.dealbreakers && room.dealbreakers.length > 0
    ? room.dealbreakers.join(', ')
    : 'No explicit dealbreakers; basic respect applies.';

  return [
    `# ${room.name}`,
    ``,
    `${room.name} is a short-lived Vibe Tribe created to work on:`,
    ``,
    `> ${room.problem}`,
    ``,
    `## This room's vibe`,
    ``,
    `- **Tone**: ${tone}`,
    `- **Values**: ${values}`,
    `- **Work style**: ${work}`,
    `- **Conflict style**: ${room.vibe.conflictStyle}`,
    `- **Energy**: ${room.vibe.energy ?? 'medium'}`,
    ``,
    `## This room is *not* for`,
    ``,
    `- ${deal}`,
    ``,
    `---`,
    ``,
    `We treat this as a tribe constructed per problem, not per lifetime. People are free to join, contribute, and drift on without drama as the mission evolves.`,
  ].join('\n');
}

function buildAiPrompt(room: VibeRoom): string {
  const toneList = room.vibe.tone.join(', ') || 'none specified';
  const valuesList = room.vibe.values.join(', ') || 'none specified';
  const workStyleList = room.vibe.workStyle.join(', ') || 'flexible';
  const dealList =
    room.dealbreakers && room.dealbreakers.length > 0
      ? room.dealbreakers.join(', ')
      : 'No explicit dealbreakers; basic respect and safety apply.';

  return [
    `You are participating in a **VibeTribe**: a short-lived, problem-focused collaboration space.`,
    ``,
    `This VibeTribe is defined as a **VibeRoom** with:`,
    `- Name: ${room.name}`,
    `- Problem / Mission: ${room.problem}`,
    `- Tone: ${toneList}`,
    `- Values: ${valuesList}`,
    `- Work style: ${workStyleList}`,
    `- Conflict style: ${room.vibe.conflictStyle}`,
    `- Dealbreakers: ${dealList}`,
    ``,
    `**Principles you must follow:**`,
    ``,
    `1. **Tribe per problem, not per lifetime.**`,
    `   Treat this room as a temporary, purpose-built tribe. Do not assume long-term identity labels or tribal loyalties for participants.`,
    ``,
    `2. **Vibe over tribe.**`,
    `   Prefer grouping, suggestions, and plans that honor the declared vibe (tone, values, work style, conflict style) over political, national, or demographic divisions.`,
    ``,
    `3. **Psychological safety first.**`,
    `   Phrase recommendations so they protect safety and dignity. De-escalate when tension appears and refer back to the vibe.`,
    ``,
    `4. **Explicit about tradeoffs, neutral about sides.**`,
    `   When conflicts arise, describe tradeoffs clearly instead of "picking a side." Offer options that preserve the room's vibe.`,
    ``,
    `5. **Prefer cross-cutting, mixed crews.**`,
    `   When forming sub-groups or assigning tasks, favor configurations that mix backgrounds and perspectives as long as they fit the vibe.`,
    ``,
    `**Your job** is to:`,
    `- Help participants stay aligned with this vibe.`,
    `- Propose structures and language that express the vibe in practice.`,
    `- Gently warn when suggestions violate the vibe or dealbreakers.`,
    ``,
    `Whenever you are unsure how to respond, first restate the VibeRoom definition above and reason from it.`,
  ].join('\n');
}

function buildJson(room: VibeRoom): string {
  return JSON.stringify(
    {
      id: room.id,
      name: room.name,
      problem: room.problem,
      vibe: room.vibe,
      dealbreakers: room.dealbreakers ?? [],
      metadata: room.metadata,
    },
    null,
    2,
  );
}

function buildChatCardExtension(room: VibeRoom): string {
  const cardJson = {
    version: 'cc-1.0',
    card: {
      handle: room.id,
      did: `did:cc:${room.id}`,
      name: room.name,
      langs: [],
      links: [],
      sections: {
        creations: [],
        collabs: [],
        inspired: [],
        capabilities: [],
      },
      policies: {
        allowed_uses: ['summarize', 'answer_questions', 'link_preview'],
        disallowed_uses: ['model_training'],
        rate_limit_per_agent_per_day: 200,
      },
      agent: {
        inbox: `/api/vibe/${room.id}/proposals`,
        events: `/api/vibe/${room.id}/events`,
      },
      updated_at: new Date().toISOString().split('T')[0],
    },
    extensions: {
      vibeRoom: {
        id: room.id,
        name: room.name,
        problem: room.problem,
        vibe: room.vibe,
        dealbreakers: room.dealbreakers ?? [],
      },
    },
  };

  return JSON.stringify(cardJson, null, 2);
}

function TextBlock({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-cc-text">{label}</h3>
          {description && (
            <p className="text-xs text-cc-text-muted mt-0.5">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="cc-btn cc-btn-secondary text-xs px-3 py-1"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto rounded-lg bg-cc-bg border border-cc-border p-3 text-xs text-cc-text font-mono whitespace-pre-wrap break-words">
        {value}
      </pre>
    </div>
  );
}

export default function VibeTribePage() {
  const [roomName, setRoomName] = useState('Soft Lab: Post-tribal Design Sprint');
  const [problem, setProblem] = useState(
    'Design patterns for post-tribal, vibe-based collaboration where tribes are constructed per problem, not per lifetime.',
  );
  const [tone, setTone] = useState('playful, serious');
  const [values, setValues] = useState('curiosity, care, rigor');
  const [workStyle, setWorkStyle] = useState('async, deep-focus, short sprints');
  const [conflictStyle, setConflictStyle] = useState('gentle-direct');
  const [energy, setEnergy] = useState<VibeEnergy>('medium');
  const [dealbreakers, setDealbreakers] = useState(
    'culture-war bait, personal attacks, humiliation as a tactic',
  );

  const room = useMemo(
    () =>
      buildVibeRoom(
        roomName,
        problem,
        tone,
        values,
        workStyle,
        conflictStyle,
        energy,
        dealbreakers,
      ),
    [roomName, problem, tone, values, workStyle, conflictStyle, energy, dealbreakers],
  );

  const manifesto = useMemo(() => buildManifesto(room), [room]);
  const aiPrompt = useMemo(() => buildAiPrompt(room), [room]);
  const json = useMemo(() => buildJson(room), [room]);
  const chatCardJson = useMemo(() => buildChatCardExtension(room), [room]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-cc-bg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
          <h1 className="text-4xl font-bold text-cc-text mb-2">
            VibeTribe Designer
          </h1>
          <p className="text-cc-text-muted max-w-2xl mb-2">
            Design a short-lived Vibe Tribe: a room where people gather around a
            specific problem with a shared vibe. Your tribe is constructed{' '}
            <span className="font-semibold text-cc-text">per problem, not per lifetime</span>.
          </p>
          <p className="text-sm text-cc-text-muted max-w-2xl">
            <strong>Note:</strong> This is a reference implementation. The main VibeTribe site will be at{' '}
            <a href="https://vibebible.org/vibetribe" className="text-cc-violet hover:underline" target="_blank" rel="noopener noreferrer">
              vibebible.org/vibetribe
            </a>.
          </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-6">
            <div className="bg-cc-surface rounded-lg border border-cc-border p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-cc-text mb-2">
                  Room name
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Soft Lab: Post-tribal Design Sprint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cc-text mb-2">
                  Problem / mission
                </label>
                <textarea
                  className="h-24 w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet resize-none"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="What problem is this Vibe Tribe solving?"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-cc-text mb-2">
                    Tone (comma-separated)
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="playful, serious"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cc-text mb-2">
                    Values (comma-separated)
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    placeholder="curiosity, care, rigor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cc-text mb-2">
                    Work style (comma-separated)
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                    value={workStyle}
                    onChange={(e) => setWorkStyle(e.target.value)}
                    placeholder="async, deep-focus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cc-text mb-2">
                    Conflict style
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                    value={conflictStyle}
                    onChange={(e) => setConflictStyle(e.target.value)}
                    placeholder="gentle-direct"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cc-text mb-2">
                  Energy
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as VibeEnergy[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEnergy(opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        energy === opt
                          ? 'bg-cc-violet text-white'
                          : 'bg-cc-surface border border-cc-border text-cc-text hover:bg-cc-bg'
                      }`}
                      aria-pressed={energy === opt}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cc-text mb-2">
                  Dealbreakers (comma-separated)
                </label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-cc-border bg-cc-bg text-cc-text focus:outline-none focus:ring-2 focus:ring-cc-violet"
                  value={dealbreakers}
                  onChange={(e) => setDealbreakers(e.target.value)}
                  placeholder="culture-war bait, personal attacks"
                />
              </div>
            </div>

            <div className="bg-cc-surface rounded-lg border border-cc-border p-4 text-sm text-cc-text-muted">
              <p className="font-medium text-cc-text mb-2">About VibeTribes</p>
              <p>
                VibeTribes are temporary, problem-focused collaboration spaces. They're constructed{' '}
                <strong className="text-cc-text">per problem, not per lifetime</strong>. Learn more in the{' '}
                <a href="/docs/vibetribe/manifesto" className="text-cc-violet hover:underline" target="_blank" rel="noopener noreferrer">
                  Vibe vs Vibe Manifesto
                </a>.
              </p>
            </div>
          </div>

          {/* Right: Outputs */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-cc-text mb-2">
                Generated Outputs
              </h2>
              <p className="text-sm text-cc-text-muted">
                Copy any of these into your docs, ChatCard definitions, or paste into your AI.
              </p>
            </div>

            <TextBlock
              label="Manifesto (Markdown)"
              description="Human-readable description of your Vibe Tribe"
              value={manifesto}
            />

            <TextBlock
              label="VibeRoom JSON"
              description="Raw VibeRoom schema (for tools and APIs)"
              value={json}
            />

            <TextBlock
              label="ChatCard Extension"
              description="VibeRoom embedded in ChatCard format (card.json compatible)"
              value={chatCardJson}
            />

            <TextBlock
              label="Paste this into your AI"
              description="Ready-to-use prompt for LLMs"
              value={aiPrompt}
            />
          </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

