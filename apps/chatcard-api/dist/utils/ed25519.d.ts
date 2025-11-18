/**
 * Verify Ed25519 signature
 */
export declare function verifyEd25519({ message, signatureB64Url, publicKeyMultibase, }: {
    message: string;
    signatureB64Url: string;
    publicKeyMultibase: string;
}): Promise<boolean>;
//# sourceMappingURL=ed25519.d.ts.map