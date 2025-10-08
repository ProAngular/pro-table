import {
  Primitive,
  TableTemplateReferenceExpandableObject,
  TableTemplateReferenceObject,
} from '../types';

export function isNonEmptyObject(value: unknown): value is object {
  return value instanceof Object && Object.keys(value).length > 0;
}

export function isNonEmptyPrimitive(
  value: unknown,
): value is NonNullable<Primitive> {
  return isPrimitive(value) && value !== null && value !== undefined;
}

export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && !isWhitespaceString(value);
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

export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isTableTemplateRefExpandableObject(
  value: unknown,
): value is TableTemplateReferenceExpandableObject {
  return (
    value instanceof Object &&
    'context' in value &&
    'templateRef' in value &&
    'isExpanded' in value
  );
}

export function isTableTemplateRefObject(
  value: unknown,
): value is TableTemplateReferenceObject {
  return (
    value instanceof Object &&
    'context' in value &&
    'templateRef' in value &&
    !('isExpanded' in value)
  );
}

export function isNonEmptyValue<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function isWhitespaceString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() === '';
}
