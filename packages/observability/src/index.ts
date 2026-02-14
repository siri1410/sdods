/**
 * @sdods/observability - Logging, Tracing, Metrics
 * 
 * OpenTelemetry-compatible observability stack with fallbacks
 */

import { isDev, isProd } from '@sdods/core';

// ============================================================
// TYPES
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  service: string;
  context?: Record<string, unknown>;
  error?: Error;
  traceId?: string;
  spanId?: string;
}

export interface LoggerConfig {
  service: string;
  level?: LogLevel;
  pretty?: boolean;
  destination?: 'console' | 'json' | 'custom';
  customHandler?: (entry: LogEntry) => void;
}

export interface SpanOptions {
  attributes?: Record<string, string | number | boolean>;
  parent?: Span;
}

export interface Span {
  name: string;
  traceId: string;
  spanId: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
  status: 'ok' | 'error' | 'unset';
  
  setAttribute(key: string, value: string | number | boolean): this;
  addEvent(name: string, attributes?: Record<string, unknown>): this;
  setStatus(status: 'ok' | 'error', message?: string): this;
  end(): void;
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

export interface TracerConfig {
  service: string;
  endpoint?: string;
  sampleRate?: number;
}

export interface Counter {
  inc(value?: number, labels?: Record<string, string>): void;
}

export interface Gauge {
  set(value: number, labels?: Record<string, string>): void;
  inc(value?: number, labels?: Record<string, string>): void;
  dec(value?: number, labels?: Record<string, string>): void;
}

export interface Histogram {
  observe(value: number, labels?: Record<string, string>): void;
}

export interface MetricsConfig {
  service: string;
  endpoint?: string;
  prefix?: string;
}

// ============================================================
// LOGGER
// ============================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export class Logger {
  private config: Required<LoggerConfig>;
  private currentTraceId?: string;
  private currentSpanId?: string;

  constructor(config: LoggerConfig) {
    this.config = {
      level: isDev ? 'debug' : 'info',
      pretty: isDev,
      destination: 'console',
      customHandler: () => {},
      ...config,
    };
  }

  setTraceContext(traceId: string, spanId: string): void {
    this.currentTraceId = traceId;
    this.currentSpanId = spanId;
  }

  clearTraceContext(): void {
    this.currentTraceId = undefined;
    this.currentSpanId = undefined;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatEntry(entry: LogEntry): string {
    if (this.config.pretty) {
      const levelColors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
        fatal: '\x1b[35m', // magenta
      };
      const reset = '\x1b[0m';
      const color = levelColors[entry.level];
      
      let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;
      
      if (entry.context && Object.keys(entry.context).length > 0) {
        output += ` ${JSON.stringify(entry.context)}`;
      }
      
      if (entry.traceId) {
        output += ` (trace=${entry.traceId.slice(0, 8)})`;
      }
      
      return output;
    }
    
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      service: entry.service,
      message: entry.message,
      ...entry.context,
      traceId: entry.traceId,
      spanId: entry.spanId,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      } : undefined,
    });
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      service: this.config.service,
      context,
      error,
      traceId: this.currentTraceId,
      spanId: this.currentSpanId,
    };

    const formatted = this.formatEntry(entry);

    switch (this.config.destination) {
      case 'console':
        if (level === 'error' || level === 'fatal') {
          console.error(formatted);
        } else if (level === 'warn') {
          console.warn(formatted);
        } else {
          console.log(formatted);
        }
        break;
      case 'json':
        console.log(formatted);
        break;
      case 'custom':
        this.config.customHandler(entry);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('fatal', message, context, error);
  }

  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);
    childLogger.currentTraceId = this.currentTraceId;
    childLogger.currentSpanId = this.currentSpanId;
    // Context would be merged in production implementation
    return childLogger;
  }
}

// ============================================================
// TRACER
// ============================================================

function generateId(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

class SpanImpl implements Span {
  name: string;
  traceId: string;
  spanId: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, string | number | boolean> = {};
  events: SpanEvent[] = [];
  status: 'ok' | 'error' | 'unset' = 'unset';

  private onEnd: (span: Span) => void;

  constructor(
    name: string,
    traceId: string,
    options: SpanOptions,
    onEnd: (span: Span) => void
  ) {
    this.name = name;
    this.traceId = traceId;
    this.spanId = generateId(16);
    this.startTime = Date.now();
    this.onEnd = onEnd;

    if (options.attributes) {
      this.attributes = { ...options.attributes };
    }
  }

  setAttribute(key: string, value: string | number | boolean): this {
    this.attributes[key] = value;
    return this;
  }

  addEvent(name: string, attributes?: Record<string, unknown>): this {
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
    return this;
  }

  setStatus(status: 'ok' | 'error', message?: string): this {
    this.status = status;
    if (message) {
      this.attributes['status.message'] = message;
    }
    return this;
  }

  end(): void {
    this.endTime = Date.now();
    this.onEnd(this);
  }
}

export class Tracer {
  private config: TracerConfig;
  private spans: Span[] = [];

  constructor(config: TracerConfig) {
    this.config = {
      sampleRate: 1.0,
      ...config,
    };
  }

  private shouldSample(): boolean {
    return Math.random() < (this.config.sampleRate || 1.0);
  }

  startSpan(name: string, options: SpanOptions = {}): Span {
    if (!this.shouldSample()) {
      // Return a no-op span
      return {
        name,
        traceId: '',
        spanId: '',
        startTime: 0,
        attributes: {},
        events: [],
        status: 'unset',
        setAttribute: () => ({ } as Span),
        addEvent: () => ({ } as Span),
        setStatus: () => ({ } as Span),
        end: () => {},
      } as Span;
    }

    const traceId = options.parent?.traceId || generateId(32);
    
    const span = new SpanImpl(name, traceId, options, (completedSpan) => {
      this.onSpanEnd(completedSpan);
    });

    this.spans.push(span);
    return span;
  }

  private onSpanEnd(span: Span): void {
    if (isDev) {
      const duration = (span.endTime || Date.now()) - span.startTime;
      console.log(`[TRACE] ${span.name} (${duration}ms) trace=${span.traceId.slice(0, 8)}`);
    }

    // In production, send to collector
    if (isProd && this.config.endpoint) {
      // Send span to OpenTelemetry collector
      // This would be implemented with actual OTLP export
    }
  }

  /**
   * Wrap an async function with tracing
   */
  async trace<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    options: SpanOptions = {}
  ): Promise<T> {
    const span = this.startSpan(name, options);
    try {
      const result = await fn(span);
      span.setStatus('ok');
      return result;
    } catch (error) {
      span.setStatus('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      span.end();
    }
  }
}

// ============================================================
// METRICS
// ============================================================

export class Metrics {
  private config: MetricsConfig;
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  constructor(config: MetricsConfig) {
    this.config = {
      prefix: '',
      ...config,
    };
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    const prefix = this.config.prefix ? `${this.config.prefix}_` : '';
    const labelStr = labels ? Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',') : '';
    return `${prefix}${name}{${labelStr}}`;
  }

  counter(name: string): Counter {
    return {
      inc: (value = 1, labels?: Record<string, string>) => {
        const key = this.getKey(name, labels);
        const current = this.counters.get(key) || 0;
        this.counters.set(key, current + value);
      },
    };
  }

  gauge(name: string): Gauge {
    return {
      set: (value: number, labels?: Record<string, string>) => {
        const key = this.getKey(name, labels);
        this.gauges.set(key, value);
      },
      inc: (value = 1, labels?: Record<string, string>) => {
        const key = this.getKey(name, labels);
        const current = this.gauges.get(key) || 0;
        this.gauges.set(key, current + value);
      },
      dec: (value = 1, labels?: Record<string, string>) => {
        const key = this.getKey(name, labels);
        const current = this.gauges.get(key) || 0;
        this.gauges.set(key, current - value);
      },
    };
  }

  histogram(name: string): Histogram {
    return {
      observe: (value: number, labels?: Record<string, string>) => {
        const key = this.getKey(name, labels);
        const values = this.histograms.get(key) || [];
        values.push(value);
        this.histograms.set(key, values);
      },
    };
  }

  /**
   * Get all metrics in Prometheus format
   */
  toPrometheus(): string {
    const lines: string[] = [];

    for (const [key, value] of this.counters) {
      lines.push(`# TYPE ${key.split('{')[0]} counter`);
      lines.push(`${key} ${value}`);
    }

    for (const [key, value] of this.gauges) {
      lines.push(`# TYPE ${key.split('{')[0]} gauge`);
      lines.push(`${key} ${value}`);
    }

    for (const [key, values] of this.histograms) {
      const name = key.split('{')[0];
      lines.push(`# TYPE ${name} histogram`);
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      lines.push(`${key.replace('}', ',le="+Inf"}')} ${count}`);
      lines.push(`${name}_sum${key.includes('{') ? key.slice(key.indexOf('{')) : '{}'} ${sum}`);
      lines.push(`${name}_count${key.includes('{') ? key.slice(key.indexOf('{')) : '{}'} ${count}`);
    }

    return lines.join('\n');
  }
}

// ============================================================
// CONVENIENCE FACTORIES
// ============================================================

export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}

export function createTracer(config: TracerConfig): Tracer {
  return new Tracer(config);
}

export function createMetrics(config: MetricsConfig): Metrics {
  return new Metrics(config);
}
