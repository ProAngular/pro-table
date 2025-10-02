import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableComponent } from '../public/table/table.component';
import { TableSortChangeEvent } from '../public/types';
import { quickSort } from '../public/utilities';
import { COLUMNS, DATA, MyCustomData } from './table-example-data';

@Component({
  selector: 'pro-table-example',
  templateUrl: './table-example.component.html',
  imports: [CommonModule, MatCheckboxModule, TableComponent],
  standalone: true,
  styleUrl: './table-example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExampleComponent {
  public constructor() {
    effect(() => {
      const copyEmail = this.copyEmail();
      const sortableHeaders = this.sortableHeaders();
      this.columns.set(
        COLUMNS.map((column) => ({
          ...column,
          copyable: column.key === 'email' ? copyEmail : column.copyable,
          isSortable: sortableHeaders,
        })),
      );
    });
  }

  private currentSort: TableSortChangeEvent<MyCustomData> = {
    key: null,
    direction: null,
  };

  private readonly matSnackBar = inject(MatSnackBar);

  protected readonly columns = signal(COLUMNS);
  protected readonly copyEmail = signal(false);
  protected readonly data = signal(DATA);
  protected readonly highlightOddRows = signal(false);
  protected readonly rowClickEnabled = signal(false);
  protected readonly selectable = signal(false);
  protected readonly selectedRows = signal<readonly MyCustomData[]>([]);
  protected readonly sortableHeaders = signal(false);
  protected readonly stickyHeader = signal(false);

  protected onRowClick(row: MyCustomData): void {
    this.matSnackBar.open(`Row clicked with ID: ${row.id}`, 'Close', {
      duration: 3000,
    });
  }

  protected onRowSelect(rows: readonly MyCustomData[]): void {
    this.selectedRows.set(rows);
  }

  protected onSortChange(event: TableSortChangeEvent<MyCustomData>): void {
    const { key, direction } = event;

    if (key === null) {
      this.data.set(DATA);
      return;
    }

    this.currentSort = event;
    this.data.set(quickSort(this.data(), key as keyof MyCustomData, direction));
  }

  protected pretifyJson(value: unknown): string {
    return JSON.stringify(value, undefined, 4);
  }
}
