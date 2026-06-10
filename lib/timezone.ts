// South African Standard Time (UTC+2)
export const SAST_TIMEZONE = 'Africa/Johannesburg';

export function getSASTDate(date: Date = new Date()): Date {
  // Convert UTC to SAST
  const sastOffset = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  return new Date(date.getTime() + sastOffset);
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

export function getSASTISOString(date: Date = new Date()): string {
  // Returns ISO string but with SAST offset
  const sastDate = getSASTDate(date);
  return sastDate.toISOString();
}

// For database timestamps that should be SAST
export function getSASTTimestamp(): string {
  const now = new Date();
  // Format: YYYY-MM-DD HH:MM:SS+02
  const sastDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return sastDate.toISOString().replace('Z', '+02:00');
}
