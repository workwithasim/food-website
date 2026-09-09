import pino from "pino";

export interface LogContext {
  requestId?: string;
  tenantId?: string;
  branchId?: string;
  actorId?: string;
  actorType?: string;
  service?: string;
  [key: string]: unknown;
}

const redactFields = [
  "password",
  "passwordHash",
  "otp",
  "token",
  "refreshToken",
  "secret",
  "cardNumber",
  "cvv",
  "authorization"
];

export const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: redactFields.flatMap((field) => [
      field,
      `*.${field}`,
      `*.*.${field}`,
      `req.headers.${field}`,
      `body.${field}`
    ]),
    censor: "[REDACTED]"
  },
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export class StructuredLogger {
  private context: LogContext;
  private logger: pino.Logger;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.logger = baseLogger.child(context);
  }

  child(extraContext: LogContext): StructuredLogger {
    return new StructuredLogger({ ...this.context, ...extraContext });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta, message);
  }
}

export const appLogger = new StructuredLogger({ service: "food-platform" });
