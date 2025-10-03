import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BodyComponent, FooterComponent, HeaderComponent } from './layout';
import { TableExampleComponent } from './table-example/table-example.component';

@Component({
  selector: 'pro-root',
  imports: [
    BodyComponent,
    FooterComponent,
    HeaderComponent,
    RouterOutlet,
    TableExampleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
