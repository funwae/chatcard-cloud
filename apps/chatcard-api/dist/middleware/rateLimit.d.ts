/**
 * General API rate limiter
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for authentication endpoints
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const magicLinkLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const magicLinkHourlyLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for proof registration
 */
export declare const proofLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.d.ts.map