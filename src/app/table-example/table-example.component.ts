import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableComponent } from '../public/table/table.component';
import { TableColumn, TableSortChangeEvent } from '../public/types';
import { jsonSafeReplacer, quickSort } from '../public/utilities';
import {
  COLUMNS,
  COLUMNS_EXPANDABLE,
  CustomData,
  CustomDataExpandable,
  DATA,
} from './table-example-data';

@Component({
  selector: 'pro-table-example',
  templateUrl: './table-example.component.html',
  imports: [CommonModule, MatCheckboxModule, TableComponent],
  standalone: true,
  styleUrl: './table-example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExampleComponent implements OnInit {
  public constructor() {
    effect(() => {
      const copyEmail = this.copyEmail();
      const enableExpandableRows = this.enableExpandableRows();
      const sortableHeaders = this.sortableHeaders();

      if (enableExpandableRows) {
        const columnsExpandable: Array<TableColumn<CustomDataExpandable>> =
          COLUMNS_EXPANDABLE.map((column) => ({
            ...column,
            copyable: column.key === 'email' ? copyEmail : column.copyable,
            isSortable: column.key === 'template' ? false : sortableHeaders,
          }));
        this.columnsExpandable.set(columnsExpandable);
      } else {
        const columns: Array<TableColumn<CustomData>> = COLUMNS.map(
          (column) => ({
            ...column,
            copyable: column.key === 'email' ? copyEmail : column.copyable,
            isSortable: sortableHeaders,
          }),
        );
        this.columns.set(columns);
      }
    });
  }

  private readonly matSnackBar = inject(MatSnackBar);

  protected readonly enableExpandableRows = signal(false);

  protected readonly copyEmail = signal(false);
  protected readonly enableMaxSelect = signal(false);
  protected readonly highlightOddRows = signal(false);
  protected readonly rowClickEnabled = signal(false);
  protected readonly selectable = signal(false);
  protected readonly selectedRows = signal<readonly CustomDataExpandable[]>([]);
  protected readonly sortableHeaders = signal(false);
  protected readonly stickyHeader = signal(false);

  protected readonly columns = signal(COLUMNS);
  protected readonly data = signal(DATA);

  @ViewChild('expendableRow', { static: true })
  public readonly expendableRow!: TemplateRef<unknown>;
  protected readonly columnsExpandable = signal(COLUMNS_EXPANDABLE);
  protected readonly dataExpandable = signal<readonly CustomDataExpandable[]>(
    [],
  );

  public ngOnInit(): void {
    this.dataExpandable.set(
      this.data().map((item) => this.mapTemplateToData(item)),
    );
  }

  protected onRowClick(row: CustomDataExpandable): void {
    this.matSnackBar.open(`Row clicked with ID: ${row.id}`, 'Close', {
      duration: 3000,
    });
  }

  protected onRowSelect(rows: readonly CustomDataExpandable[]): void {
    this.selectedRows.set(
      rows.map(({ template, ...rest }) => rest as typeof rest),
    );
  }

  protected onSortChange(
    event: TableSortChangeEvent<CustomDataExpandable>,
  ): void {
    const { key, direction } = event;
    const expandable = this.enableExpandableRows();

    if (key === null || !direction) {
      if (expandable) {
        this.dataExpandable.set(
          this.data().map((i) => this.mapTemplateToData(i)),
        );
      } else {
        this.data.set([...DATA]);
      }
      return;
    }

    if (expandable) {
      const sorted = quickSort(
        [...this.dataExpandable()],
        key as keyof CustomDataExpandable,
        direction,
      );
      this.dataExpandable.set([...sorted]);
    } else {
      const sorted = quickSort(
        [...this.data()],
        key as keyof CustomData,
        direction,
      );
      this.data.set([...sorted]);
    }
  }

  protected pretifyJson(value: unknown): string {
    try {
      return JSON.stringify(value, jsonSafeReplacer, 2);
    } catch {
      return String(value);
    }
  }

  private mapTemplateToData(item: CustomData): CustomDataExpandable {
    return {
      ...item,
      template: {
        context: { data: item },
        isExpanded: false,
        templateRef: this.expendableRow,
      },
    };
  }
}
