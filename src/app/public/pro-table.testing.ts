import { DateTime } from 'luxon';

import {
  Component,
  TemplateRef,
  TrackByFunction,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { TableComponent } from './table/table.component';
import {
  TableColumn,
  TableSortChangeEvent,
  TableTemplateReferenceExpandableObject,
  TableTemplateReferenceObject,
} from './types';
import { quickSort } from './utilities';

/** A row shape used by the specs. */
export interface TestRow {
  active: boolean;
  address: { city: string };
  age: number | null;
  badge: TableTemplateReferenceObject | null;
  details: TableTemplateReferenceExpandableObject | null;
  id: number;
  joined: DateTime | Date | null;
  name: string;
}

/** Three rows with a nested field, a boolean, a zero and a null. */
export function createRows(): TestRow[] {
  return [
    {
      active: true,
      address: { city: 'Austin' },
      age: 30,
      badge: null,
      details: null,
      id: 1,
      joined: null,
      name: 'Cara',
    },
    {
      active: false,
      address: { city: 'Boston' },
      age: 0,
      badge: null,
      details: null,
      id: 2,
      joined: null,
      name: 'Abe',
    },
    {
      active: true,
      address: { city: 'Chicago' },
      age: null,
      badge: null,
      details: null,
      id: 3,
      joined: null,
      name: 'Bo',
    },
  ];
}

/** Columns for the default rows. Name and city sort, age does not. */
export function createColumns(): Array<TableColumn<TestRow>> {
  return [
    { isSortable: true, key: 'name', label: 'Name' },
    {
      isSortable: true,
      key: 'address.city',
      label: 'City',
      sortKey: 'cityName',
    },
    { key: 'age', label: 'Age' },
    { key: 'active', label: 'Active' },
  ];
}

/**
 * Binds `pro-table[columns][data]` to signals so a spec can change any input
 * and read every emitted event.
 */
@Component({
  selector: 'pro-test-host',
  imports: [TableComponent],
  template: `
    <ng-template #detail let-name="name">Details for {{ name }}</ng-template>
    <ng-template #badge let-label="label"
      ><b>{{ label }}</b></ng-template
    >
    <pro-table
      [columns]="columns()"
      [data]="data()"
      [highlightOddRows]="highlightOddRows()"
      [initialSort]="initialSort()"
      [maxSelectableRows]="maxSelectableRows()"
      [placeholderEmptyData]="placeholderEmptyData()"
      [placeholderEmptyList]="placeholderEmptyList()"
      [placeholderLoading]="placeholderLoading()"
      [rowClickEnabled]="rowClickEnabled()"
      [selectable]="selectable()"
      [stickyHeader]="stickyHeader()"
      [trackByFn]="trackByFn()"
      (rowClick)="rowClicks.push($event)"
      (rowSelectChange)="selections.push($event)"
      (sortChange)="onSortChange($event)"
    />
  `,
})
export class TestHostComponent {
  public readonly table =
    viewChild.required<TableComponent<TestRow>>(TableComponent);

  public readonly detailTemplate =
    viewChild.required<TemplateRef<unknown>>('detail');

  public readonly badgeTemplate =
    viewChild.required<TemplateRef<unknown>>('badge');

  public readonly columns =
    signal<ReadonlyArray<TableColumn<TestRow>>>(createColumns());

  public readonly data = signal<readonly TestRow[] | null | undefined>(
    createRows(),
  );

  public readonly highlightOddRows = signal(false);

  public readonly initialSort = signal<TableSortChangeEvent<TestRow> | null>(
    null,
  );

  public readonly maxSelectableRows = signal<unknown>(null);

  public readonly placeholderEmptyData = signal('N/A');

  public readonly placeholderEmptyList = signal('No items to display.');

  public readonly placeholderLoading = signal('Loading...');

  public readonly rowClickEnabled = signal(false);

  public readonly selectable = signal(false);

  public readonly stickyHeader = signal(false);

  public readonly trackByFn = signal<TrackByFunction<TestRow>>(
    (_index, item) => item.id,
  );

  /** When true, a sort event reorders `data` like a real consumer would. */
  public readonly autoSort = signal(false);

  public readonly rowClicks: TestRow[] = [];

  public readonly selections: Array<readonly TestRow[]> = [];

  public readonly sorts: Array<TableSortChangeEvent<TestRow>> = [];

  protected onSortChange(event: TableSortChangeEvent<TestRow>): void {
    this.sorts.push(event);
    const { direction, key } = event;
    if (!this.autoSort() || !direction || !key) {
      return;
    }
    this.data.update((rows) =>
      rows ? quickSort(rows, key as keyof TestRow, direction) : rows,
    );
  }
}

/** Run change detection, let pending work finish, then run it once more. */
export async function settle(
  fixture: ComponentFixture<unknown>,
): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

/** The host element of a fixture. */
export function root(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

/** Find an element inside the fixture or fail the spec loudly. */
export function select<T extends Element = HTMLElement>(
  fixture: ComponentFixture<unknown>,
  selector: string,
): T {
  const element = root(fixture).querySelector<T>(selector);
  if (!element) {
    throw new Error(`No element matches "${selector}".`);
  }
  return element;
}

/** Find every element inside the fixture that matches a selector. */
export function selectAll<T extends Element = HTMLElement>(
  fixture: ComponentFixture<unknown>,
  selector: string,
): T[] {
  return Array.from(root(fixture).querySelectorAll<T>(selector));
}

/** Collapsed text of an element. */
export function textOf(element: Element): string {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** The collapsed text of every cell in each body row. */
export function bodyRows(fixture: ComponentFixture<unknown>): string[][] {
  return selectAll(fixture, 'tr.mat-mdc-row:not(.expandable-row)').map((row) =>
    Array.from(row.querySelectorAll('td')).map(textOf),
  );
}
