import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TableComponent } from '../public/table/table.component';

@Component({
  selector: 'pro-table-example',
  templateUrl: './table-example.component.html',
  imports: [CommonModule, TableComponent],
  standalone: true,
  styleUrl: './table-example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExampleComponent {}
