export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && !isWhitespaceString(value);
}

export function isNonEmptyValue<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function isWhitespaceString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() === '';
}
