'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Proposal {
  id: string;
  title: string;
  url?: string;
  section: string;
  authorship: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    try {
      const data = await apiClient.getProposals();
      setProposals(data);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await apiClient.approveProposal(id);
      loadProposals();
    } catch (error) {
      console.error('Failed to approve proposal:', error);
    }
  }

  async function handleReject(id: string) {
    try {
      await apiClient.rejectProposal(id);
      loadProposals();
    } catch (error) {
      console.error('Failed to reject proposal:', error);
    }
  }

  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-cc-text mb-8">Dashboard</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-cc-text mb-4">
            Pending Proposals
          </h2>
          {loading ? (
            <p className="text-cc-text-muted">Loading...</p>
          ) : proposals.length === 0 ? (
            <p className="text-cc-text-muted">No pending proposals</p>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-4 rounded-lg border border-cc-border bg-cc-surface"
                >
                  <h3 className="text-lg font-semibold text-cc-text mb-2">
                    {proposal.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-cc-text-muted mb-4">
                    <span>Section: {proposal.section}</span>
                    <span>Authorship: {proposal.authorship}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(proposal.id)}
                      className="px-4 py-2 rounded-lg bg-cc-violet text-white hover:brightness-110"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(proposal.id)}
                      className="px-4 py-2 rounded-lg border border-cc-border text-cc-text hover:bg-cc-surface-soft"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-cc-text mb-4">
            Quick Actions
          </h2>
          <div className="flex gap-4">
            <a
              href="/me/proof-studio"
              className="cc-btn cc-btn-primary"
            >
              Proof Studio
            </a>
            <a
              href="/me/settings"
              className="cc-btn cc-btn-secondary"
            >
              Settings
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

