import { Request, Response, NextFunction } from 'express';
import { Registry, Counter, Histogram } from 'prom-client';
export declare const register: Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const httpRequestsTotal: Counter<"route" | "status" | "method">;
export declare const httpRequestDuration: Histogram<"route" | "status" | "method">;
/**
 * Middleware to track HTTP metrics
 */
export declare function metricsMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=metrics.d.ts.map