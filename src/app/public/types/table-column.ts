import { NestedKeysOfString } from './keys';

export interface TableColumn<T extends object> {
  /** Whether the column data is copyable on click */
  copyable?: boolean;
  /** Whether the column is sortable */
  isSortable?: boolean;
  /** The key of the column in the data source */
  key: NestedKeysOfString<T>;
  /** The label for the column */
  label: string;
  /** Minimum width of the column in pixels */
  minWidthPx?: number;
  /** The sort key for the column (if it differs from the `key`) */
  sortKey?: NestedKeysOfString<T> | string;
}
