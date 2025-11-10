'use client'

import React, { useState } from 'react';
import { ChatCard } from '../../components/ChatCard';
import {
  ChatCardProfile,
  ChatCardScope,
  ChatCardStatus,
} from '../../types/chatcard';

const profile: ChatCardProfile = {
  id: 'card_01HX9ZK0ABCDEF',
  displayName: 'Hayden',
  handle: '@hayden',
  primaryLanguage: 'en',
  secondaryLanguages: ['zh'],
  tone: 'casual',
  readingLevel: 'standard',
  accessibility: { largeText: true },
  modelPreferences: { provider: 'openai', model: 'gpt-5-thinking' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const scopes: ChatCardScope[] = [
  {
    id: 'read_page',
    label: 'Read page content',
    level: 'read',
    description: 'Let your AI read visible content on this page.',
    required: true,
  },
  {
    id: 'suggest_actions',
    label: 'Suggest actions',
    level: 'suggest',
    description: 'Let your AI suggest actions but not click or submit on its own.',
  },
  {
    id: 'act_with_confirmation',
    label: 'Act with confirmation',
    level: 'act_with_confirmation',
    description: 'Your AI can perform actions only after you confirm each one.',
  },
];

export const ChatCardExample: React.FC = () => {
  const [status, setStatus] = useState<ChatCardStatus>('idle');

  const connect = () => {
    setStatus('connecting');
    setTimeout(() => {
      setStatus('connected');
    }, 1200);
  };

  const disconnect = () => {
    setStatus('revoked');
    setTimeout(() => setStatus('idle'), 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <ChatCard
        profile={profile}
        scopes={scopes}
        status={status}
        variant="dark"
        onConnect={connect}
        onDisconnect={disconnect}
      />
    </div>
  );
};

