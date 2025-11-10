'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ChatCardProfile,
  ChatCardScope,
  ChatCardStatus,
} from '../types/chatcard';

interface ChatCardProps {
  profile: ChatCardProfile;
  scopes: ChatCardScope[];
  status: ChatCardStatus;
  compact?: boolean;
  variant?: 'dark' | 'light';
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const statusLabel: Record<ChatCardStatus, string> = {
  idle: 'Not connected',
  connecting: 'Connecting…',
  connected: 'Connected',
  revoked: 'Access revoked',
  error: 'Error',
};

const statusClassDark: Record<ChatCardStatus, string> = {
  idle: 'bg-slate-100 text-slate-700',
  connecting: 'bg-blue-100 text-blue-700',
  connected: 'bg-emerald-100 text-emerald-700',
  revoked: 'bg-rose-100 text-rose-700',
  error: 'bg-amber-100 text-amber-800',
};

const statusClassLight: Record<ChatCardStatus, string> = {
  idle: 'bg-slate-200 text-slate-600',
  connecting: 'bg-blue-200 text-blue-700',
  connected: 'bg-emerald-200 text-emerald-800',
  revoked: 'bg-rose-200 text-rose-800',
  error: 'bg-amber-200 text-amber-900',
};

export const ChatCard: React.FC<ChatCardProps> = ({
  profile,
  scopes,
  status,
  compact = false,
  variant = 'dark',
  onConnect,
  onDisconnect,
}) => {
  const [showBack, setShowBack] = useState(false);

  const handlePrimaryAction = () => {
    if (status === 'connected' || status === 'connecting') {
      onDisconnect?.();
    } else {
      onConnect?.();
    }
  };

  const primaryLabel =
    status === 'connected'
      ? 'Disconnect ChatCard'
      : status === 'connecting'
      ? 'Connecting…'
      : 'Connect ChatCard';

  const isDark = variant === 'dark';
  const statusClass = isDark ? statusClassDark : statusClassLight;

  return (
    <div className="relative max-w-md w-full">
      <div className="group relative h-full">
        {/* Card frame with holographic gradient */}
        <div className="relative rounded-3xl border border-slate-200/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-[1.5px] shadow-2xl shadow-slate-900/50 overflow-hidden">
          {/* Holographic shimmer effect */}
          <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full shimmer-animation" />
          </div>

          {/* Holographic color shifts */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/20 via-blue-500/20 to-purple-500/20" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-transparent via-indigo-500/10 to-transparent" />
          </div>

          <div className={`relative rounded-3xl ${isDark ? 'bg-slate-950/95' : 'bg-white/95'} p-4 sm:p-5 ${isDark ? 'text-slate-100' : 'text-slate-900'} backdrop-blur-sm`}>
            {/* Card header with microcopy */}
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-3">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    width={40}
                    height={40}
                    unoptimized
                    className={`rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'} object-cover shadow-lg`}
                  />
                ) : (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'} text-xs font-semibold uppercase tracking-wide shadow-lg`}>
                    {profile.displayName.slice(0, 2)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {profile.displayName}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ChatCard · {profile.handle ?? profile.id.slice(0, 10)}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass[status]}`}
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {statusLabel[status]}
              </span>
            </div>

            {/* Microcopy: Card type indicator */}
            <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} mb-3 font-mono tracking-wider`}>
              AI IDENTITY CARD · VERIFIED · PORTABLE
            </div>

            {/* Divider with gradient */}
            <div className={`my-4 h-px bg-gradient-to-r ${isDark ? 'from-slate-800/0 via-slate-700/70 to-slate-800/0' : 'from-slate-200/0 via-slate-300/70 to-slate-200/0'}`} />

            {/* Front / back views */}
            {!showBack ? (
              <FrontView profile={profile} scopes={scopes} compact={compact} isDark={isDark} />
            ) : (
              <BackView profile={profile} scopes={scopes} isDark={isDark} />
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={status === 'connecting'}
                className={`inline-flex flex-1 items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 ${
                  status === 'connected'
                    ? 'bg-rose-500 text-white shadow-rose-500/40 hover:bg-rose-600'
                    : 'bg-emerald-500 text-white shadow-emerald-500/40 hover:bg-emerald-400'
                }`}
              >
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowBack((v) => !v)}
                className={`inline-flex items-center justify-center rounded-2xl border px-3 py-2 text-xs font-medium transition-colors ${
                  isDark
                    ? 'border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-900'
                    : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {showBack ? 'View summary' : 'View details'}
              </button>
            </div>

            {/* Bottom microcopy */}
            <div className={`mt-3 text-[9px] ${isDark ? 'text-slate-600' : 'text-slate-400'} text-center font-mono`}>
              {profile.id.slice(0, 8)} · {new Date(profile.updatedAt).getFullYear()}
            </div>
          </div>
        </div>

        {/* Enhanced glow effect */}
        <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          status === 'connected' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
        }`} />
      </div>
    </div>
  );
};

interface FrontProps {
  profile: ChatCardProfile;
  scopes: ChatCardScope[];
  compact?: boolean;
  isDark: boolean;
}

const FrontView: React.FC<FrontProps> = ({ profile, scopes, compact, isDark }) => {
  const primaryLang = profile.primaryLanguage.toUpperCase();
  const langs = [primaryLang, ...(profile.secondaryLanguages ?? [])]
    .map((l) => l.toUpperCase())
    .slice(0, 3);

  const visibleScopes = scopes.slice(0, compact ? 2 : 3);

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
          isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-700'
        }`}>
          Persona: <span className="ml-1 capitalize">{profile.tone}</span>
        </span>
        {profile.readingLevel && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
            isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            Reading: {profile.readingLevel}
          </span>
        )}
        {langs.length > 0 && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
            isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'
          }`}>
            Languages: {langs.join(' · ')}
          </span>
        )}
      </div>

      <div className={`rounded-2xl border p-3 ${
        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'
      }`}>
        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          This AI knows:
        </p>
        <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          <li>
            • How you prefer to be spoken to (tone, language, style).
          </li>
          <li>
            • Your accessibility preferences (where supported).
          </li>
          <li>
            • Which actions apps are allowed to ask it to take.
          </li>
        </ul>
      </div>

      <div>
        <p className={`mb-1 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Requested scopes</p>
        <div className="space-y-1.5">
          {visibleScopes.map((scope) => (
            <ScopePill key={scope.id} scope={scope} isDark={isDark} />
          ))}
          {scopes.length > visibleScopes.length && (
            <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              + {scopes.length - visibleScopes.length} more scopes (view details).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const BackView: React.FC<{ profile: ChatCardProfile; scopes: ChatCardScope[]; isDark: boolean }> = ({
  profile,
  scopes,
  isDark,
}) => {
  return (
    <div className="space-y-3 text-sm">
      <div className={`rounded-2xl border p-3 ${
        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'
      }`}>
        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Profile details</p>
        <dl className="grid grid-cols-2 gap-y-1.5 text-[11px]">
          <div>
            <dt className={isDark ? 'text-slate-500' : 'text-slate-400'}>Card ID</dt>
            <dd className={`font-mono text-[10px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{profile.id}</dd>
          </div>
          <div>
            <dt className={isDark ? 'text-slate-500' : 'text-slate-400'}>Primary language</dt>
            <dd className={isDark ? 'text-slate-200' : 'text-slate-700'}>{profile.primaryLanguage.toUpperCase()}</dd>
          </div>
          {profile.modelPreferences?.provider && (
            <div>
              <dt className={isDark ? 'text-slate-500' : 'text-slate-400'}>Preferred provider</dt>
              <dd className={isDark ? 'text-slate-200' : 'text-slate-700'}>{profile.modelPreferences.provider}</dd>
            </div>
          )}
          {profile.modelPreferences?.model && (
            <div>
              <dt className={isDark ? 'text-slate-500' : 'text-slate-400'}>Preferred model</dt>
              <dd className={`font-mono text-[10px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {profile.modelPreferences.model}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className={`rounded-2xl border p-3 ${
        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'
      }`}>
        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Permissions</p>
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {scopes.map((scope) => (
            <ScopeRow key={scope.id} scope={scope} isDark={isDark} />
          ))}
        </div>
      </div>

      <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        This card does not share your login. It only describes how AI should act on your behalf and what it&apos;s allowed to do on
        this site.
      </p>
    </div>
  );
};

const ScopePill: React.FC<{ scope: ChatCardScope; isDark: boolean }> = ({ scope, isDark }) => {
  const levelLabel: Record<ChatCardScope['level'], string> = {
    read: 'Read-only',
    suggest: 'Suggest',
    act_with_confirmation: 'Act w/ confirm',
    act_unconfirmed: 'Act',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${
      isDark
        ? 'border-slate-700 bg-slate-950/60 text-slate-200'
        : 'border-slate-300 bg-white/60 text-slate-700'
    }`}>
      <span className="mr-1.5 h-1 w-1 rounded-full bg-emerald-400" />
      <span className="font-medium mr-1">{scope.label}</span>
      <span className={`mx-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>·</span>
      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{levelLabel[scope.level]}</span>
      {scope.required && (
        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
          isDark ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-100 text-rose-700'
        }`}>
          required
        </span>
      )}
    </span>
  );
};

const ScopeRow: React.FC<{ scope: ChatCardScope; isDark: boolean }> = ({ scope, isDark }) => {
  const levelColor: Record<ChatCardScope['level'], string> = {
    read: isDark ? 'text-sky-300' : 'text-sky-600',
    suggest: isDark ? 'text-emerald-300' : 'text-emerald-600',
    act_with_confirmation: isDark ? 'text-amber-300' : 'text-amber-600',
    act_unconfirmed: isDark ? 'text-rose-300' : 'text-rose-600',
  };

  const levelLabel: Record<ChatCardScope['level'], string> = {
    read: 'Read-only',
    suggest: 'Suggest',
    act_with_confirmation: 'Act with confirmation',
    act_unconfirmed: 'Act without confirmation',
  };

  return (
    <div className={`flex flex-col rounded-xl border px-2.5 py-2 ${
      isDark
        ? 'border-slate-800 bg-slate-950/60'
        : 'border-slate-200 bg-white/60'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{scope.label}</span>
        <span className={`text-[11px] font-medium ${levelColor[scope.level]}`}>
          {levelLabel[scope.level]}
        </span>
      </div>
      <p className={`mt-0.5 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{scope.description}</p>
    </div>
  );
};

