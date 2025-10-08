export function getDate(value: unknown): Date | null {
  return value instanceof Date ? value : null;
}
