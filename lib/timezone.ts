// South African Standard Time (UTC+2)
export const SAST_TIMEZONE = 'Africa/Johannesburg';
export const SAST_OFFSET_MS = 2 * 60 * 60 * 1000; // 2 hours

export function getSASTDate(date: Date = new Date()): Date {
  // Convert UTC to SAST
  return new Date(date.getTime() + SAST_OFFSET_MS);
}

export function formatSAST(date: Date = new Date()): string {
  return new Date(date).toLocaleString('en-ZA', {
    timeZone: SAST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function formatSASTDate(date: Date = new Date()): string {
  return new Date(date).toLocaleString('en-ZA', {
    timeZone: SAST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false
  });
}

export function formatSASTDateTime(date: Date = new Date()): string {
  return new Date(date).toLocaleString('en-ZA', {
    timeZone: SAST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function getSASTISOString(date: Date = new Date()): string {
  const sastDate = getSASTDate(date);
  return sastDate.toISOString().replace('Z', '+02:00');
}

export function getSASTTimestamp(): string {
  const now = new Date();
  const sastDate = new Date(now.getTime() + SAST_OFFSET_MS);
  return sastDate.toISOString().replace('Z', '+02:00');
}

export function getSASTForDatabase(): string {
  const now = new Date();
  const sastDate = new Date(now.getTime() + SAST_OFFSET_MS);
  return sastDate.toISOString();
}

// For form timestamps
export function getFormTimestamp(): string {
  return getSASTISOString();
}

// For payment confirmation timestamps
export function getPaymentTimestamp(): string {
  return getSASTISOString();
}

// For unlock request timestamps
export function getUnlockTimestamp(): string {
  return getSASTISOString();
}

// For user presence timestamps
export function getPresenceTimestamp(): string {
  return getSASTISOString();
}
