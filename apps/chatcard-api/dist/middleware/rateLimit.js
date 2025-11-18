import rateLimit from 'express-rate-limit';
/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
});
export const magicLinkLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many magic link requests, please try again in a minute',
});
export const magicLinkHourlyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many magic link requests, please try again later',
});
/**
 * Rate limiter for proof registration
 */
export const proofLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 proof registrations per hour
    message: 'Too many proof registrations, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.js.map