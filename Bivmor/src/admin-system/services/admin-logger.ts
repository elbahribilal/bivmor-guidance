// Admin Action Logger - Client-side action logging
// مسجّل إجراءات نظام الإدارة

export interface AdminLogEntry {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// In-memory log for the current session
const sessionLogs: AdminLogEntry[] = [];

/**
 * Log an admin action locally (client-side).
 * This is in addition to any server-side logging via the API.
 */
export function logAdminAction(
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, unknown>
): void {
  const entry: AdminLogEntry = {
    action,
    entity,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };

  sessionLogs.push(entry);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Admin Action]', entry);
  }
}

/**
 * Get all admin actions logged in the current session.
 */
export function getSessionLogs(): AdminLogEntry[] {
  return [...sessionLogs];
}

/**
 * Clear the session log.
 */
export function clearSessionLogs(): void {
  sessionLogs.length = 0;
}

/**
 * Format a log entry for display.
 */
export function formatLogEntry(entry: AdminLogEntry): string {
  const time = new Date(entry.timestamp).toLocaleTimeString('ar-MA');
  const entity = entry.entityId ? `${entry.entity}#${entry.entityId.slice(0, 8)}` : entry.entity;
  return `[${time}] ${entry.action} ${entity}`;
}
