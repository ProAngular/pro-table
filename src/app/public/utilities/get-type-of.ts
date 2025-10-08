import { DateTime } from 'luxon';

export function getTypeOf(
  value: unknown,
): 'date' | 'datetime' | 'time' | string {
  if (value instanceof Date) {
    return 'date';
  }

  if (value instanceof DateTime) {
    return 'datetime';
  }

  return typeof value;
}
