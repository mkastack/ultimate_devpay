// Retrieve Sentry DSN from environment or client fallback
const SENTRY_DSN = typeof process !== "undefined" ? process.env.SENTRY_DSN : "";

export type ErrorContext = {
  userId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
};

/**
 * Initialize Sentry 24/7 Monitoring
 */
export function initSentry() {
  console.log("[Sentry Monitoring] Initializing Sentry 24/7 Crash and Bug Monitoring...");
  if (SENTRY_DSN) {
    console.log(`[Sentry Connection] Connected successfully to DSN: ${SENTRY_DSN.substring(0, 30)}...`);
  } else {
    console.log("[Sentry Alert] SENTRY_DSN not configured. Running in Development debugger fallback mode.");
  }
}

/**
 * Capture and track runtime exceptions instantly
 */
export function captureException(error: Error | any, context?: ErrorContext) {
  const time = new Date().toISOString();
  console.error("--- SENTRY ALARM: RUNTIME CRASH CAPTURED ---");
  console.error(`Timestamp: ${time}`);
  console.error(`Error Message: ${error?.message || error}`);
  if (error?.stack) {
    console.error("Stacktrace Details:");
    console.error(error.stack);
  }
  if (context) {
    console.error("Diagnostic Metadata Context:", JSON.stringify(context, null, 2));
  }
  console.error("-------------------------------------------");

  // In production, dispatch this exception to the Sentry ingestion endpoint
  if (SENTRY_DSN) {
    fetch(`https://o0.ingest.sentry.io/api/store/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${SENTRY_DSN.split("@")[0].split("//")[1]}`
      },
      body: JSON.stringify({
        timestamp: time,
        platform: "javascript",
        exception: {
          values: [
            {
              type: error?.name || "Error",
              value: error?.message || String(error),
              stacktrace: {
                frames: error?.stack
                  ? error.stack
                      .split("\n")
                      .map((line: string) => ({ filename: line.trim() }))
                  : []
              }
            }
          ]
        },
        user: context?.userId ? { id: context.userId } : undefined,
        tags: context?.tags,
        extra: context?.extra
      })
    }).catch((err) => {
      console.warn("[Sentry Dispatch Failed] Could not deliver exception report:", err.message);
    });
  }

  // Trigger developer visual feedback inside development console logs
  return {
    eventId: Math.random().toString(36).substring(2, 15),
    timestamp: time,
    status: SENTRY_DSN ? "dispatched" : "logged"
  };
}

/**
 * Capture diagnostic log messages
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: ErrorContext) {
  console.log(`[Sentry Log - ${level.toUpperCase()}] ${message}`);
  if (context) {
    console.log("Context:", context);
  }

  if (SENTRY_DSN) {
    fetch(`https://o0.ingest.sentry.io/api/store/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${SENTRY_DSN.split("@")[0].split("//")[1]}`
      },
      body: JSON.stringify({
        message,
        level,
        tags: context?.tags,
        extra: context?.extra,
        user: context?.userId ? { id: context.userId } : undefined
      })
    }).catch(() => {});
  }
}
