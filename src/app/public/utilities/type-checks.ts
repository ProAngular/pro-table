import { Primitive } from '../types';

export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  );
}

export function isNonEmptyPrimitive(
  value: unknown,
): value is NonNullable<Primitive> {
  return isPrimitive(value) && value !== null && value !== undefined;
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
