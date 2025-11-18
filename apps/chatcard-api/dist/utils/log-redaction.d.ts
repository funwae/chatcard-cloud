/**
 * Log redaction utilities
 * Redacts PII and sensitive data from logs
 */
/**
 * Redact email addresses (keep domain visible)
 */
export declare function redactEmail(email: string | null | undefined): string;
/**
 * Redact IP addresses (keep first 3 octets)
 */
export declare function redactIp(ip: string | null | undefined): string;
/**
 * Redact DIDs (keep prefix and first 8 chars)
 */
export declare function redactDid(did: string | null | undefined): string;
/**
 * Redact keys/tokens (keep first 8 chars)
 */
export declare function redactKey(key: string | null | undefined): string;
/**
 * Redact object recursively
 */
export declare function redactObject(obj: any): any;
/**
 * Pino redaction paths
 */
export declare const pinoRedactionPaths: string[];
//# sourceMappingURL=log-redaction.d.ts.map