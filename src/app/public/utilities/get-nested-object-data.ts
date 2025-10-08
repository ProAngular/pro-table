import { DateTime } from 'luxon';

import { DefinedPrimitive, NestedKeysOfString } from '../types';
import { isNonEmptyPrimitive } from './type-checks';

export function getNestedObjectData<T>(
  data: T,
  stringKeys: NestedKeysOfString<T>,
): DefinedPrimitive | object | Date | DateTime | null {
  const keys = stringKeys.split('.');
  let value: unknown = data;

  for (const key of keys) {
    if (
      value instanceof Object &&
      Object.prototype.hasOwnProperty.call(value, key)
    ) {
      value = value[key as keyof typeof value];
    }
  }

  if (isNonEmptyPrimitive(value) || typeof value === 'object') {
    return value;
  }

  return null;
}
