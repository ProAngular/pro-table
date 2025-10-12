import { SortDirection } from '@angular/material/sort';

import { NestedKeysOfString } from './keys';

export interface TableSortChangeEvent<T> {
  /** The direction of the sort, or null if cleared */
  direction: SortDirection | null;
  /** The column key being sorted */
  key: NestedKeysOfString<T> | string | null;
}
