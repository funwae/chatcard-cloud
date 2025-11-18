import { Registry, Counter, Histogram } from 'prom-client';
// Create a Registry to register metrics
export const register = new Registry();
// HTTP request counter
export const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});
// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [register],
});
/**
 * Middleware to track HTTP metrics
 */
export function metricsMiddleware(req, res, next) {
    const start = Date.now();
    const route = req.route?.path || req.path || 'unknown';
    // Track response
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000; // seconds
        const status = res.statusCode.toString();
        httpRequestsTotal.inc({
            method: req.method,
            route,
            status,
        });
        httpRequestDuration.observe({
            method: req.method,
            route,
            status,
        }, duration);
    });
    next();
}
//# sourceMappingURL=metrics.js.map