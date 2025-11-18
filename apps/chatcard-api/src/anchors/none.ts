import type { AnchorProvider, AnchorStatus } from './index.js';

const mem: Record<string, AnchorStatus> = {};

export const provider: AnchorProvider = {
  name: 'none',
  async queue(mh: string) {
    mem[mh] = { state: 'confirmed' };
    return mh;
  },
  async status(jobId: string) {
    return mem[jobId] ?? { state: 'confirmed' };
  },
};

