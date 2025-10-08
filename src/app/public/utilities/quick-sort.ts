import { SortDirection } from '@angular/material/sort';

export function quickSort<T>(
  data: readonly T[],
  key: keyof T,
  direction: SortDirection | null,
): readonly T[] {
  return [...data].sort((a, b) => {
    const valueA = a[key] as T;
    const valueB = b[key] as T;

    if (valueA === null || valueA === undefined) {
      return 1;
    }
    if (valueB === null || valueB === undefined) {
      return -1;
    }

    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}
