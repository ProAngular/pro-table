import { SortDirection } from '@angular/material/sort';

import { NestedKeysOfString } from './keys';

export interface TableSortChangeEvent<T> {
  direction: SortDirection | null;
  key: NestedKeysOfString<T> | string | null;
}
