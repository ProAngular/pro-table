import {
  BehaviorSubject,
  ReplaySubject,
  combineLatest,
  firstValueFrom,
  map,
  shareReplay,
} from 'rxjs';

import { Clipboard } from '@angular/cdk/clipboard';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  TrackByFunction,
  ViewChild,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatSort,
  MatSortModule,
  Sort,
  SortDirection,
} from '@angular/material/sort';
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

const rT = { required: true };
const rF = { required: false };
const rFB = { required: false, transform: booleanAttribute };
const rFN = { required: false, transform: numberAttribute };

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
})
export class TableComponent<T extends object & { id: number | string }>
  implements AfterViewInit
{
  /** ---- INJECTED SERVICE DEPENDENCIES ---- */

  private readonly clipboard = inject(Clipboard);
  private readonly destroyRef = inject(DestroyRef);
  private readonly matSnackBar = inject(MatSnackBar);

  /** ---- INPUT BINDINGS (REQUIRED) ---- */

  @Input(rT) public set columns(value: ReadonlyArray<TableColumn<T>>) {
    this.columnsSubject.next(value);
  }

  @Input(rT)
  public set data(values: readonly T[] | null | undefined) {
    if (values === null || values === undefined) {
      this.dataSubject.next(null);
      return;
    }
    this.dataSubject.next(
      new MatTableDataSource<T, MatPaginator>(Array.from(values)),
    );
  }

  /** ---- INPUT BINDINGS (OPTIONAL) ---- */

  @Input(rF) public initialSort: TableSortChangeEvent<T> | null = null;

  @Input(rF) public placeholderEmptyData = 'N/A';

  @Input(rF) public placeholderEmptyList = 'No items to display.';

  @Input(rF) public placeholderLoading = 'Loading...';

  @Input(rF) public set selectable(value: BooleanInput) {
    this.selectableSubject.next(coerceBooleanProperty(value));
  }

  @Input(rFB) public stickyHeader = false;

  @Input(rFN) public maxSelectableRows: number | null = null;

  /** ---- INPUT + HOST BINDINGS ---- */

  @HostBinding('class.highlight-odd-rows')
  @Input(rF)
  public highlightOddRows = false;

  @HostBinding('class.clickable')
  @Input(rF)
  public rowClickEnabled = false;

  /** ---- OUTPUT EVENTS ---- */

  @Output() public readonly rowClick = new EventEmitter<T>();

  @Output() public readonly rowSelectChange = new EventEmitter<readonly T[]>();

  @Output() public readonly sortChange = new EventEmitter<
    TableSortChangeEvent<T>
  >();

  /** ---- DATA STREAMS ---- */

  private readonly selectableSubject = new BehaviorSubject<boolean>(false);

  protected readonly selectableChanges = this.selectableSubject
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

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

  private readonly dataSubject = new ReplaySubject<
    MatTableDataSource<T, MatPaginator> | null | undefined
  >(1);

  protected readonly dataChanges = this.dataSubject
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private readonly isAllSelectedSubject = new BehaviorSubject<boolean>(false);

  protected readonly isAllSelectedChanges =
    this.isAllSelectedSubject.asObservable();

  /** ---- UTILITIES ---- */

  protected readonly getData = _getData;

  protected readonly getDate = _getDate;

  protected readonly getTypeOf = _getTypeOf;

  protected readonly isNonEmptyObject = _isNonEmptyObject;

  protected readonly isTableTemplateRefExpandableObject =
    _isTableTemplateRefExpandableObject;

  protected readonly isTableTemplateRefObject = _isTableTemplateRefObject;

  /** ---- MEMBERS ---- */

  @ViewChild(MatSort) private matSort!: MatSort;

  protected selectedKeys = new Set<string | number>();

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

  /** ---- FUNCTIONS ---- */

  public ngAfterViewInit(): void {
    if (!this.matSort) {
      throw new Error('MatSort is not initialized.');
    }

    const init = this.initialSort;
    if (init?.key && init.direction) {
      this.matSort.sort({
        disableClear: false,
        id: init.key,
        start: init.direction satisfies SortDirection,
      });
    }
  }

  public clearSelected(): void {
    this.selectedKeys.clear();
    this.rowSelectChange.emit([]);
    this.updateAllSelectedStatus();
  }

  @Input()
  public trackByFn: TrackByFunction<T> = (_index, item) => item['id'];

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
