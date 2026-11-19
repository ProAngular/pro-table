import { Clipboard } from '@angular/cdk/clipboard';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  TrackByFunction,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DateTimePipe } from '../pipes';
import {
  TableColumn,
  TableSortChangeEvent,
  TableTemplateReferenceExpandableObject,
} from '../types';
import {
  getData as _getData,
  getDate as _getDate,
  getTypeOf as _getTypeOf,
  isNonEmptyObject as _isNonEmptyObject,
  isTableTemplateRefExpandableObject as _isTableTemplateRefExpandableObject,
  isTableTemplateRefObject as _isTableTemplateRefObject,
  copyToClipboard,
  isNonEmptyString,
} from '../utilities';

/** Turns the input into a number, or `null` when it isn't a number. */
const nullableNumberAttribute = (value: unknown): number | null => {
  const result = numberAttribute(value);
  return Number.isNaN(result) ? null : result;
};

/**
 * A custom table component wrapper for Angular Material's table component.
 *
 * @see https://material.angular.dev/components/table/overview
 */
@Component({
  selector: 'pro-table[columns][data]',
  imports: [
    DatePipe,
    MatCheckboxModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    NgTemplateOutlet,
    DateTimePipe,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  host: {
    '[class.highlight-odd-rows]': 'highlightOddRows()',
    '[class.clickable]': 'rowClickEnabled()',
  },
})
export class TableComponent<
  T extends object & { id: number | string },
> implements AfterViewInit {
  /** ---- INJECTED SERVICE DEPENDENCIES ---- */

  private readonly clipboard = inject(Clipboard);
  private readonly matSnackBar = inject(MatSnackBar);

  /** ---- INPUT BINDINGS (REQUIRED) ---- */

  public readonly columns = input.required<ReadonlyArray<TableColumn<T>>>();

  public readonly data = input.required<readonly T[] | null | undefined>();

  /** ---- INPUT BINDINGS (OPTIONAL) ---- */

  public readonly highlightOddRows = input(false);

  public readonly initialSort = input<TableSortChangeEvent<T> | null>(null);

  public readonly maxSelectableRows = input<number | null, unknown>(null, {
    transform: nullableNumberAttribute,
  });

  public readonly placeholderEmptyData = input('N/A');

  public readonly placeholderEmptyList = input('No items to display.');

  public readonly placeholderLoading = input('Loading...');

  public readonly rowClickEnabled = input(false);

  public readonly selectable = input(false, { transform: booleanAttribute });

  public readonly stickyHeader = input(false, { transform: booleanAttribute });

  public readonly trackByFn = input<TrackByFunction<T>>(
    (_index, item) => item['id'],
  );

  /** ---- OUTPUT EVENTS ---- */

  public readonly rowClick = output<T>();

  public readonly rowSelectChange = output<readonly T[]>();

  public readonly sortChange = output<TableSortChangeEvent<T>>();

  /** ---- UTILITIES ---- */

  protected readonly getData = _getData;

  protected readonly getDate = _getDate;

  protected readonly getTypeOf = _getTypeOf;

  protected readonly isNonEmptyObject = _isNonEmptyObject;

  protected readonly isTableTemplateRefExpandableObject =
    _isTableTemplateRefExpandableObject;

  protected readonly isTableTemplateRefObject = _isTableTemplateRefObject;

  /** ---- STATE ---- */

  private readonly matSort = viewChild(MatSort);

  protected readonly selectedKeys = signal<ReadonlySet<string | number>>(
    new Set<string | number>(),
  );

  protected readonly expandableObject =
    signal<TableTemplateReferenceExpandableObject | null>(null);

  /** The table data source, or `null` while the data is still loading. */
  protected readonly dataSource = computed(() => {
    const values = this.data();
    if (values === null || values === undefined) {
      return null;
    }
    return new MatTableDataSource<T, MatPaginator>(Array.from(values));
  });

  protected readonly rows = computed(() => this.dataSource()?.data ?? []);

  protected readonly columnKeys = computed(() => {
    const keys: string[] = this.columns().map(({ key }) => key);
    return this.selectable() ? ['select', ...keys] : keys;
  });

  protected readonly isAllSelected = computed(() => {
    const rows = this.rows();
    const keys = this.selectedKeys();
    return rows.length > 0 && rows.every((row) => keys.has(this.keyOf(row)));
  });

  /** ---- FUNCTIONS ---- */

  public ngAfterViewInit(): void {
    const matSort = this.matSort();
    if (!matSort) {
      return; // `mat-sort` isn't used, return early
    }

    const init = this.initialSort();
    if (init?.key && init.direction) {
      matSort.sort({
        disableClear: false,
        id: init.key,
        start: init.direction,
      });
    }
  }

  public clearSelected(): void {
    this.selectedKeys.set(new Set<string | number>());
    this.rowSelectChange.emit([]);
  }

  protected isRowExpanded(
    rowObjectData: T,
    expandableObject: TableTemplateReferenceExpandableObject | null,
  ): boolean {
    if (expandableObject === null) return false;
    const obj = rowObjectData as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      if (obj[k] === expandableObject) return true;
    }
    return false;
  }

  protected isSelected(row: T): boolean {
    return this.selectedKeys().has(this.keyOf(row));
  }

  protected masterToggle(): void {
    const rows = this.rows();
    const max = this.maxSelectableRows();
    const next = new Set(this.selectedKeys());
    const allSelected = rows.every((row) => next.has(this.keyOf(row)));

    if (allSelected || (max !== null && next.size >= max)) {
      for (const row of rows) next.delete(this.keyOf(row));
    } else {
      for (const row of rows) {
        if (max !== null && next.size >= max) {
          this.notifyMaxSelected(max);
          break;
        }
        next.add(this.keyOf(row));
      }
    }

    this.selectedKeys.set(next);
    this.rowSelectChange.emit(this.getSelectedRows());
  }

  protected onRowClick(
    rowObjectData: T,
    event: MouseEvent,
    column?: TableColumn<T>,
    item?: HTMLTableCellElement,
  ): void {
    event.stopPropagation();

    if (column?.copyable && item) {
      this.copyToClipboard(item);
      return;
    }
    if (!this.rowClickEnabled()) return;

    this.rowClick.emit(rowObjectData);
  }

  protected onSortChange(sort: Sort): void {
    const key = sort.active;
    const direction = isNonEmptyString(sort.direction) ? sort.direction : null;
    const column = this.columns().find((c) => c.key === key);
    if (!column?.isSortable) return;

    this.sortChange.emit({
      direction,
      key:
        direction && isNonEmptyString(key)
          ? (column.sortKey ?? column.key)
          : null,
    });
  }

  protected toggleExpandable(
    value: TableTemplateReferenceExpandableObject,
  ): void {
    this.expandableObject.update((current) =>
      current === value ? null : value,
    );
  }

  protected toggleSelection(row: T): void {
    const key = this.keyOf(row);
    const max = this.maxSelectableRows();
    const next = new Set(this.selectedKeys());

    if (next.has(key)) {
      next.delete(key);
    } else {
      if (max !== null && next.size >= max) {
        this.notifyMaxSelected(max);
        return;
      }
      next.add(key);
    }

    this.selectedKeys.set(next);
    this.rowSelectChange.emit(this.getSelectedRows());
  }

  private copyToClipboard(item: HTMLTableCellElement): void {
    const content = item.innerHTML.replace(/<[^>]*>/g, '').trim();
    const copied = copyToClipboard(content, this.clipboard);

    if (!copied) {
      this.matSnackBar.open(
        `Failed to copy "${content}" to clipboard!`,
        'Close',
        { duration: 3000 },
      );
      return;
    }

    this.matSnackBar.open(`Copied "${content}" to clipboard!`, 'Close', {
      duration: 3000,
    });
  }

  private getSelectedRows(): T[] {
    const keys = this.selectedKeys();
    return this.rows().filter((row) => keys.has(this.keyOf(row)));
  }

  private keyOf(row: T): string | number {
    return this.trackByFn()(0, row) as string | number;
  }

  private notifyMaxSelected(max: number): void {
    this.matSnackBar.open(`You can only select up to ${max} rows.`, 'Close', {
      duration: 3000,
    });
  }
}
