const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor() {
    this.level = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;
    this.prefix = '[ChatsApp]';
  }

  setLevel(level) {
    this.level = level;
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const levelStr = Object.keys(LOG_LEVELS).find(
      key => LOG_LEVELS[key] === level
    );
    
    return {
      timestamp,
      level: levelStr,
      prefix: this.prefix,
      message,
      data,
    };
  }

  debug(message, data) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      const log = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
      console.log(
        `${log.timestamp} ${log.level} ${log.prefix}: ${log.message}`,
        data || ''
      );
    }
  }

  info(message, data) {
    if (this.level <= LOG_LEVELS.INFO) {
      const log = this.formatMessage(LOG_LEVELS.INFO, message, data);
      console.info(
        `${log.timestamp} ${log.level} ${log.prefix}: ${log.message}`,
        data || ''
      );
    }
  }

  warn(message, data) {
    if (this.level <= LOG_LEVELS.WARN) {
      const log = this.formatMessage(LOG_LEVELS.WARN, message, data);
      console.warn(
        `${log.timestamp} ${log.level} ${log.prefix}: ${log.message}`,
        data || ''
      );
    }
  }

  error(message, error) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const log = this.formatMessage(LOG_LEVELS.ERROR, message, error);
      console.error(
        `${log.timestamp} ${log.level} ${log.prefix}: ${log.message}`,
        error || ''
      );

      // Log to crash reporting service in production
      if (!__DEV__) {
        this.reportError(error);
      }
    }
  }

  reportError(error) {
    // Send to your error reporting service (e.g., Firebase Crashlytics, Sentry)
    try {
      // crashlytics().recordError(error);
      // Sentry.captureException(error);
    } catch (e) {
      console.error('Error reporting failed:', e);
    }
  }

  // Performance logging
  timeStart(label) {
    if (__DEV__) {
      console.time(`${this.prefix}: ${label}`);
    }
  }

  timeEnd(label) {
    if (__DEV__) {
      console.timeEnd(`${this.prefix}: ${label}`);
    }
  }

  // Network request logging
  logRequest(url, method, data) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  logResponse(url, status, data) {
    if (status >= 400) {
      this.error(`API Error: ${status} ${url}`, data);
    } else {
      this.debug(`API Response: ${status} ${url}`, data);
    }
  }
}

export default new Logger();
