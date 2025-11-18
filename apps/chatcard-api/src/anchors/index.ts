export type AnchorState = 'queued' | 'posted' | 'confirmed' | 'failed';
export type AnchorStatus = { state: AnchorState; txid?: string };

export interface AnchorProvider {
  name: string;
  queue: (proofMh: string) => Promise<string>; // provider job id/handle
  status: (jobId: string) => Promise<AnchorStatus>;
}

export function getAnchorProvider(kind: string): AnchorProvider {
  switch (kind) {
    case 'opentimestamps':
      return require('./opentimestamps.js').provider;
    case 'evm-l2':
      return require('./evm-l2.js').provider;
    default:
      return require('./none.js').provider;
  }
}

