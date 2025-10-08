import { DateTime } from 'luxon';

import { DefinedPrimitive, NestedKeysOfString } from '../types';
import { getNestedObjectData } from './get-nested-object-data';

export function getData<T>(
  dataSourceItem: T,
  columnKey: NestedKeysOfString<T>,
  placeholderEmptyData: string,
): DefinedPrimitive | object | Date | DateTime {
  const data = getNestedObjectData<T>(dataSourceItem, columnKey);
  if (data === 0) {
    return '0';
  }

  if (typeof data === 'boolean') {
    return data ? 'True' : 'False';
  }

  if (data === null) {
    return placeholderEmptyData;
  }

  return data;
}
