import { DateTime } from 'luxon';
import {
  BehaviorSubject,
  ReplaySubject,
  combineLatest,
  filter,
  firstValueFrom,
  map,
  shareReplay,
} from 'rxjs';

import { Clipboard } from '@angular/cdk/clipboard';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  TrackByFunction,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DateTimePipe } from '../pipes';
import {
  DefinedPrimitive,
  NestedKeysOfString,
  TableColumn,
  TableSortChangeEvent,
  TableTemplateReferenceExpandableObject,
  TableTemplateReferenceObject,
} from '../types';
import {
  isNonEmptyPrimitive,
  isNonEmptyString,
  isNonEmptyValue,
} from '../utilities';
import { TABLE_ANIMATIONS } from './table-animations';

/**
 * A custom table component wrapper for Angular Material's table component.
 *
 * @see https://material.angular.dev/components/table/overview
 */
@Component({
  selector: 'pro-table[columns][data]',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatTooltipModule,
    DateTimePipe,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: TABLE_ANIMATIONS,
})
export class TableComponent<T extends object & { id: number }>
  implements OnInit
{
  private readonly clipboard = inject(Clipboard);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly matSnackBar = inject(MatSnackBar);

  @Input({ required: false }) public set selectable(value: BooleanInput) {
    this.selectableSubject.next(coerceBooleanProperty(value));
  }
  private readonly selectableSubject = new BehaviorSubject<boolean>(false);
  protected readonly selectableChanges = this.selectableSubject
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  @Input({ required: true }) public set columns(
    value: ReadonlyArray<TableColumn<T>>,
  ) {
    this.columnsSubject.next(value);
  }
  private readonly columnsSubject = new ReplaySubject<
    ReadonlyArray<TableColumn<T>>
  >(1);
  protected readonly columnsChanges = this.columnsSubject.asObservable();

  protected readonly columnKeysChanges = combineLatest([
    this.columnsSubject,
    this.selectableChanges,
  ]).pipe(
    map(([columns, selectable]) => {
      const keys = columns.map(({ key }) => key);
      return selectable ? ['select', ...keys] : keys;
    }),
    takeUntilDestroyed(this.destroyRef),
  );

  @Input({ required: false })
  @HostBinding('class.clickable')
  public rowClickEnabled = false;

  @Input({ required: true })
  public set data(values: readonly T[] | null | undefined) {
    if (values === null || values === undefined) {
      this.dataSubject.next(null);
      return;
    }

    this.dataSubject.next(
      new MatTableDataSource<T, MatPaginator>(Array.from(values)),
    );
  }

  @Input() @HostBinding('class.highlight-odd-rows') public highlightOddRows =
    false;

  @Input({ required: false, transform: numberAttribute })
  public maxSelectableRows: number | null = null;

  @Input({ required: false }) public placeholderEmptyList =
    'No items to display.';

  @Input({ required: false }) public placeholderEmptyData = 'N/A';

  @Input({ required: false }) public placeholderLoading = 'Loading...';

  @Input({ required: false, transform: booleanAttribute })
  public stickyHeader = false;

  @Output() public readonly rowClick = new EventEmitter<T>();

  @Output() public readonly rowSelectChange = new EventEmitter<readonly T[]>();

  @Output() public readonly sortChange = new EventEmitter<
    TableSortChangeEvent<T>
  >();

  private readonly dataSubject = new ReplaySubject<
    MatTableDataSource<T, MatPaginator> | null | undefined
  >(1);
  protected readonly dataChanges = this.dataSubject
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  protected selectedKeys = new Set<string | number>();

  private readonly isAllSelectedSubject = new BehaviorSubject<boolean>(false);
  protected readonly isAllSelectedChanges =
    this.isAllSelectedSubject.asObservable();

  protected set expandableObject(
    value: TableTemplateReferenceExpandableObject | null,
  ) {
    if (value !== null && !this.isTableTemplateRefExpandableObject(value)) {
      throw new Error(
        'The expandable value must be of type TableTemplateReferenceExpandableObject.',
      );
    }
    this.#expandableObject = value;
  }
  protected get expandableObject(): TableTemplateReferenceExpandableObject | null {
    return this.#expandableObject;
  }
  #expandableObject: TableTemplateReferenceExpandableObject | null = null;

  @HostBinding('class.expandable') private isRowExpansionEnabled = false;

  public async ngOnInit(): Promise<void> {
    const matTableDataSource = await firstValueFrom(
      this.dataChanges.pipe(filter(isNonEmptyValue)),
    );
    this.isRowExpansionEnabled =
      matTableDataSource?.data.some((row) => {
        for (const key in row) {
          if (Object.prototype.hasOwnProperty.call(row, key)) {
            if (this.isTableTemplateRefExpandableObject(row[key])) return true;
          }
        }
        return false;
      }) ?? false;
  }

  public clearSelected(): void {
    this.selectedKeys.clear();
    this.rowSelectChange.emit([]);
    this.updateAllSelectedStatus();
  }

  public scrollTop({ offset = 0 }: { offset?: number } = {}): void {
    const topOfTableWithOffset =
      this.elementRef.nativeElement.getBoundingClientRect().top +
      window.scrollY -
      offset;
    window.scrollTo({ top: topOfTableWithOffset, behavior: 'smooth' });
  }

  @Input()
  public trackByFn: TrackByFunction<T> = (_index, item) => item['id'];

  protected getData(
    dataSourceItem: T,
    columnKey: NestedKeysOfString<T>,
  ): DefinedPrimitive | object | Date | DateTime {
    const data = this.getNestedObjectData<T>(dataSourceItem, columnKey);
    if (data === 0) return '0';
    if (typeof data === 'boolean') return data ? 'True' : 'False';
    if (data === null) return this.placeholderEmptyData;
    return data;
  }

  protected getDate(value: unknown): Date | null {
    return value instanceof Date ? value : null;
  }

  protected getNestedObjectData<T>(
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

  protected getTypeOf(value: unknown): 'date' | 'datetime' | 'time' | string {
    if (value instanceof Date) return 'date';
    if (value instanceof DateTime) return 'datetime';
    return typeof value;
  }

  protected isNonEmptyObject(value: unknown): value is object {
    return value instanceof Object && Object.keys(value).length > 0;
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
    return this.selectedKeys.has(this.trackByFn(0, row));
  }

  protected isTableTemplateRefObject(
    value: unknown,
  ): value is TableTemplateReferenceObject {
    return (
      value instanceof Object &&
      'context' in value &&
      'templateRef' in value &&
      !('isExpanded' in value)
    );
  }

  protected isTableTemplateRefExpandableObject(
    value: unknown,
  ): value is TableTemplateReferenceExpandableObject {
    return (
      value instanceof Object &&
      'context' in value &&
      'templateRef' in value &&
      'isExpanded' in value
    );
  }

  protected async masterToggle(): Promise<void> {
    const data = (await firstValueFrom(this.dataChanges))?.data ?? [];
    const allSelected = data.every((row) => this.isSelected(row));

    if (
      allSelected ||
      (this.maxSelectableRows !== null &&
        this.selectedKeys.size >= this.maxSelectableRows)
    ) {
      for (const row of data) this.selectedKeys.delete(this.trackByFn(0, row));
    } else {
      for (const row of data) {
        if (
          this.maxSelectableRows !== null &&
          this.selectedKeys.size >= this.maxSelectableRows
        ) {
          this.matSnackBar.open(
            `You can only select up to ${this.maxSelectableRows} rows.`,
            'Close',
            { duration: 3000 },
          );
          break;
        }
        this.selectedKeys.add(this.trackByFn(0, row));
      }
    }

    this.rowSelectChange.emit(await this.getSelectedRows());
    this.updateAllSelectedStatus();
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
    if (!this.rowClickEnabled) return;

    this.rowClick.emit(rowObjectData);
  }

  protected async onSortChange(sort: Sort): Promise<void> {
    const key = sort.active;
    const direction = isNonEmptyString(sort.direction) ? sort.direction : null;
    const columns = await firstValueFrom(this.columnsSubject);
    const column = columns.find((c) => c.key === key);
    if (!column?.isSortable) return;

    const sortChange: TableSortChangeEvent<T> = {
      direction,
      key:
        direction && isNonEmptyString(key)
          ? (column.sortKey ?? column.key)
          : null,
    };
    this.sortChange.emit(sortChange);
  }

  protected async toggleSelection(row: T): Promise<void> {
    const key = this.trackByFn(0, row);
    if (this.selectedKeys.has(key)) {
      this.selectedKeys.delete(key);
    } else {
      if (
        this.maxSelectableRows !== null &&
        this.selectedKeys.size >= this.maxSelectableRows
      ) {
        this.matSnackBar.open(
          `You can only select up to ${this.maxSelectableRows} rows.`,
          'Close',
          { duration: 3000 },
        );
        return;
      }
      this.selectedKeys.add(key);
    }

    this.rowSelectChange.emit(await this.getSelectedRows());
    this.updateAllSelectedStatus();
  }

  private copyToClipboard(item: HTMLTableCellElement): void {
    const content = item.innerHTML.replace(/<[^>]*>/g, '').trim();

    if (!isNonEmptyString(content)) {
      throw new Error('Failed to copy empty string to the clipboard!');
    }

    const ok = this.clipboard.copy(content);
    if (!ok) {
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

  private async getSelectedRows(): Promise<T[]> {
    const data = (await firstValueFrom(this.dataChanges))?.data ?? [];
    return data.filter((row) => this.selectedKeys.has(this.trackByFn(0, row)));
  }

  private async updateAllSelectedStatus(): Promise<void> {
    const data = (await firstValueFrom(this.dataChanges))?.data ?? [];
    const allSelected =
      data.length > 0 &&
      data.every((row) => this.selectedKeys.has(this.trackByFn(0, row)));
    this.isAllSelectedSubject.next(allSelected);
  }
}
