type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success' | 'http';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
};

function formatTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
}

function sanitizeMeta(meta: any): any {
  if (!meta || typeof meta !== 'object') return meta;
  if (meta instanceof Error) {
    return {
      message: meta.message,
      name: meta.name,
      stack: meta.stack,
      ...(meta as any),
    };
  }

  const sensitiveKeys = ['password', 'token', 'secret', 'otp', 'authorization', 'cookie'];
  const sanitized = Array.isArray(meta) ? [...meta] : { ...meta };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeMeta(sanitized[key]);
    }
  }

  return sanitized;
}

export const logger = {
  info: (message: string, meta?: any) => {
    const time = `${colors.gray}${formatTimestamp()}${colors.reset}`;
    const badge = `${colors.cyan}${colors.bold}[INFO]${colors.reset}`;
    console.log(`${time} ${badge} ${message}`, meta ? sanitizeMeta(meta) : '');
  },

  success: (message: string, meta?: any) => {
    const time = `${colors.gray}${formatTimestamp()}${colors.reset}`;
    const badge = `${colors.green}${colors.bold}[SUCCESS]${colors.reset}`;
    console.log(`${time} ${badge} ${message}`, meta ? sanitizeMeta(meta) : '');
  },

  warn: (message: string, meta?: any) => {
    const time = `${colors.gray}${formatTimestamp()}${colors.reset}`;
    const badge = `${colors.yellow}${colors.bold}[WARN]${colors.reset}`;
    console.warn(`${time} ${badge} ${colors.yellow}${message}${colors.reset}`, meta ? sanitizeMeta(meta) : '');
  },

  error: (message: string, errorOrMeta?: any) => {
    const time = `${colors.gray}${formatTimestamp()}${colors.reset}`;
    const badge = `${colors.red}${colors.bold}[ERROR]${colors.reset}`;
    console.error(`${time} ${badge} ${colors.red}${message}${colors.reset}`);
    if (errorOrMeta) {
      if (errorOrMeta.stack) {
        console.error(`${colors.dim}${errorOrMeta.stack}${colors.reset}`);
      } else {
        console.error(sanitizeMeta(errorOrMeta));
      }
    }
  },

  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      const time = `${colors.gray}${formatTimestamp()}${colors.reset}`;
      const badge = `${colors.magenta}${colors.bold}[DEBUG]${colors.reset}`;
      console.debug(`${time} ${badge} ${message}`, meta ? sanitizeMeta(meta) : '');
    }
  },

  http: (params: {
    method: string;
    url: string;
    status: number;
    durationMs: number;
    requestId?: string;
    tenantId?: string;
    userId?: string;
    ip?: string;
  }) => {
    const time = `${colors.gray}${formatTimestamp()}${colors.reset}`;

    // Colorize Method
    let methodColor = colors.blue;
    if (params.method === 'GET') methodColor = colors.cyan;
    if (params.method === 'POST') methodColor = colors.green;
    if (params.method === 'PUT' || params.method === 'PATCH') methodColor = colors.yellow;
    if (params.method === 'DELETE') methodColor = colors.red;
    const methodStr = `${methodColor}${colors.bold}${params.method.padEnd(6)}${colors.reset}`;

    // Colorize Status
    let statusColor = colors.green;
    if (params.status >= 300 && params.status < 400) statusColor = colors.cyan;
    if (params.status >= 400 && params.status < 500) statusColor = colors.yellow;
    if (params.status >= 500) statusColor = colors.red;
    const statusStr = `${statusColor}${colors.bold}${params.status}${colors.reset}`;

    // Duration formatting
    let durationColor = colors.gray;
    let slowTag = '';
    if (params.durationMs > 500) {
      durationColor = colors.red;
      slowTag = ` ${colors.bgRed}${colors.white} SLOW ${colors.reset}`;
    } else if (params.durationMs > 150) {
      durationColor = colors.yellow;
    }
    const durationStr = `${durationColor}${params.durationMs.toFixed(1)}ms${colors.reset}`;

    const reqIdStr = params.requestId ? `${colors.dim}[${params.requestId}]${colors.reset}` : '';
    const tenantStr = params.tenantId ? `${colors.dim}[tenant:${params.tenantId}]${colors.reset}` : '';

    console.log(`${time} ${methodStr} ${params.url} ${statusStr} ${durationStr} ${reqIdStr} ${tenantStr}${slowTag}`);
  },
};
