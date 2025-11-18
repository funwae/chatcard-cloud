export type AnchorState = 'queued' | 'posted' | 'confirmed' | 'failed';
export type AnchorStatus = {
    state: AnchorState;
    txid?: string;
};
export interface AnchorProvider {
    name: string;
    queue: (proofMh: string) => Promise<string>;
    status: (jobId: string) => Promise<AnchorStatus>;
}
export declare function getAnchorProvider(kind: string): AnchorProvider;
//# sourceMappingURL=index.d.ts.map