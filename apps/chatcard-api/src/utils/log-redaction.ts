/**
 * Log redaction utilities
 * Redacts PII and sensitive data from logs
 */

/**
 * Redact email addresses (keep domain visible)
 */
export function redactEmail(email: string | null | undefined): string {
  if (!email) return '[redacted]';
  const [local, domain] = email.split('@');
  if (!domain) return '[redacted]';
  // Show first 2 chars of local part
  const redactedLocal = local.length > 2 ? local.slice(0, 2) + '***' : '***';
  return `${redactedLocal}@${domain}`;
}

/**
 * Redact IP addresses (keep first 3 octets)
 */
export function redactIp(ip: string | null | undefined): string {
  if (!ip) return '[redacted]';
  // IPv4: 192.168.1.xxx
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  // IPv6: keep first 4 groups
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx';
  }
  return '[redacted]';
}

/**
 * Redact DIDs (keep prefix and first 8 chars)
 */
export function redactDid(did: string | null | undefined): string {
  if (!did) return '[redacted]';
  if (did.startsWith('did:cc:')) {
    const id = did.replace('did:cc:', '');
    return `did:cc:${id.slice(0, 8)}...`;
  }
  return '[redacted]';
}

/**
 * Redact keys/tokens (keep first 8 chars)
 */
export function redactKey(key: string | null | undefined): string {
  if (!key) return '[redacted]';
  if (key.length <= 16) return '[redacted]';
  return `${key.slice(0, 8)}...`;
}

/**
 * Redact object recursively
 */
export function redactObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactObject);
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Redact based on key name
    if (lowerKey.includes('email')) {
      redacted[key] = redactEmail(value as string);
    } else if (lowerKey.includes('ip') || lowerKey === 'remoteaddress') {
      redacted[key] = redactIp(value as string);
    } else if (lowerKey.includes('did')) {
      redacted[key] = redactDid(value as string);
    } else if (lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('secret') || lowerKey.includes('password')) {
      redacted[key] = redactKey(value as string);
    } else if (typeof value === 'object') {
      redacted[key] = redactObject(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Pino redaction paths
 */
export const pinoRedactionPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.email',
  'req.body.password',
  'req.body.token',
  'req.body.secret',
  'req.query.token',
  'req.query.secret',
  'res.headers["set-cookie"]',
  '*.email',
  '*.ip',
  '*.did',
  '*.key',
  '*.token',
  '*.secret',
  '*.password',
];

