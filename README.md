<div align="center">
  <a href="https://www.ProAngular.com" target="_blank">
    <img src="https://raw.githubusercontent.com/ProAngular/pro-table/refs/heads/main/public/images/pro-angular-logo.png" />
  </a>
  <h1 align="center">
    <a href="https://www.ProAngular.com" target="_blank">Pro Angular</a>: Table Component
  </h1>
  <a href="https://github.com/ProAngular/pro-table" target="_blank">
    View Github Repository
  </a>
  <p align="center">
    An abstraction of Angular Material’s table that speeds up development time and gives you quick access to features such as type safe columns, row selection, copy on click, expandable rows, intent based sorting, and more!
  </p>
</div>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

[![npm](https://badgen.net/badge/icon/npm?icon=npm&label)](https://www.npmjs.com/@proangular/pro-table)
[![GitHub](https://badgen.net/badge/icon/GitHub?icon=github&label)](https://github.com/ProAngular/pro-table)
[![TypeScript](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)](https://github.com/ProAngular/pro-table/search?l=typescript)
[![npm Version](https://badge.fury.io/js/@proangular%2Fngx-scroll-top.svg)](https://www.npmjs.com/@proangular/pro-table)
[![Node Version](https://badgen.net/npm/node/@proangular/pro-table)](https://www.npmjs.com/@proangular/pro-table)
[![Package Downloads](https://badgen.net/npm/dw/@proangular/pro-table)](https://www.npmjs.com/@proangular/pro-table)
[![Size](https://img.shields.io/bundlephobia/minzip/@proangular/pro-table.svg)](https://bundlephobia.com/result?p=ProAngular/pro-table)
[![Demo Status](https://badgen.net/badge/Demo/Online/green)](https://www.ProAngular.com/demos/pro-table)
[![Website Status](https://img.shields.io/website?down_color=lightgrey&down_message=Offline&label=Website&up_color=green&up_message=Online&url=https%3A%2F%2Fwww.proangular.com)](https://www.proangular.com)
[![Sponsors](https://img.shields.io/github/sponsors/proangular?label=Sponsors)](https://github.com/sponsors/ProAngular)
[![License](https://img.shields.io/npm/l/express.svg?maxAge=2592000)](/LICENSE)
[![GitHub Package Status](https://github.com/ProAngular/pro-table/actions/workflows/on-merge-main-deploy-gpr.yml/badge.svg)](https://github.com/ProAngular/pro-table/actions/workflows/on-merge-main-deploy-gpr.yml)
[![npmjs Package Status](https://github.com/ProAngular/pro-table/actions/workflows/on-merge-main-deploy-npmjs.yml/badge.svg)](https://github.com/ProAngular/pro-table/actions/workflows/on-merge-main-deploy-npmjs.yml)

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Index <a name="index"></a>

- [Preview](#preview)
- [Description](#description)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Install Pro Table Components](#install-pro-table-components)
- [Usage](#usage)
  - [Importing](#importing)
  - [Expandable Rows](#expandable-rows)
  - [API](#api)
- [Compatibility](#compatibility)
- [Contributions](#contributions)
- [Licensing](#licensing)
- [Wrapping Up](#wrapping-up)

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Preview <a name="preview"></a>

Preview the live demo below to see the Pro Table Components in action:

https://www.ProAngular.com/demos/pro-table

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Description <a name="description"></a>

`@proangular/pro-table` is a **type-safe, Angular abstraction** over Angular
Material’s table. It’s designed for apps using **standalone components, signals,
and the new control-flow syntax** so you can wire up data grids quickly without
giving up control of your data model or rendering.

The component keeps Material’s performance, accessibility, and theming surface,
while adding strongly-typed columns, selection, copy-on-click, expandable detail
rows, and a clean sorting contract that **emits intent** instead of mutating
data.

### Why it’s useful (technical)

- **Compile-time guarantees for columns & data**  
  Columns are declared as `TableColumn<T>`, where `key` is tied to your row
  model `T`. That prevents typos and drift between your data and headers.

- **Sorting as a pure UI signal**  
  The table **does not** reorder your data. Instead it emits a
  `TableSortChangeEvent<T>` with a typed key and direction; you decide how to
  sort (or not) in your host component. This keeps business logic out of the
  view layer and plays well with signals/NgRx/etc.

- **Expandable rows that are template-driven**  
  Provide a `TemplateRef` per row and the table renders it in a dedicated detail
  row using `multiTemplateDataRows`. Expansion is reference-based, so you can
  attach any context object you like.

- **Selection with guardrails**  
  Built-in single/multi select with a master checkbox, an optional **max
  selectable** limit, and an emitted list of selected rows without leaking table
  internals to the host.

- **Great DX for common table chores**  
  One-line **copy-to-clipboard** per column (with tooltip and snack-bar
  feedback), sticky headers, row click events, and cell placeholders for empty
  values. These affordances reduce the “glue code” you normally write around
  `MatTable`.

- **Built for Angular 20+ patterns**  
  Uses **OnPush** change detection, `@if/@for/@let` in templates, and small
  reactive streams (`BehaviorSubject/ReplaySubject` + `shareReplay`) to keep
  updates efficient. The example shows **signals** + `effect()` integrating
  cleanly with the component’s inputs.

### Features

- Strong typing for both column definitions and row data (`TableColumn<T>`)
- Opt-in selection with max count and `rowSelectChange` events
- Click-to-copy per column with tooltip and snackbar feedback
- Sticky header option
- **Expandable** detail rows via `TemplateRef` + `multiTemplateDataRows` with
  animations
- **Sort intent** via `sortChange` events no data mutation, you stay in control
- Works seamlessly with standalone components, signals, and Material’s
  `MatSort`/`MatTable`

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Installation <a name="installation"></a>

Using Node Package Manager ([NPM][url-node-js]) in a new terminal window run the
following commands to install the required dependencies.

### Prerequisites <a name="prerequisites"></a>

**Angular Material**

More information on theming Angular Material:
https://material.angular.io/guide/theming

```bash
ng add @angular/material
```

### Install Pro Table Components <a name="install-pro-table-components"></a>

```bash
ng add @proangular/pro-table@latest
```

or

```bash
npm install @proangular/pro-table --save
```

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Usage <a name="usage"></a>

### Importing <a name="importing"></a>

Import the table component to use in your Angular application where used:

```diff
+ import { TableComponent } from '@proangular/pro-table';

// For modules
@NgModule({
  ...
  imports: [
+   TableComponent,
    ...
  ],
})

// For standalone components
@Component({
  ...
  imports: [
+   TableComponent,
    ...
  ],
})

// Markup usage
+ <pro-table [columns]="columns" [data]="data" />
```

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

### Expandable Rows <a name="expandable-rows"></a>

```html
<pro-table [columns]="columns()" [data]="rowsWithDetailTemplate()" />

<ng-template #detailTemplate let-data="data">
  <pre>{{ data | json }}</pre>
</ng-template>
```

Map your data to include a template field typed as
`TableTemplateReferenceExpandableObject` if you want per-row detail. The table
uses `multiTemplateDataRows` and a detail row with `expandedDetail` to render
the template when expanded.

> ![Info][img-info] See example table code [here][url-example-table-code], or a
> live [demo][url-demo].

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

### API <a name="api"></a>

#### Input Bindings (required):

| Input     | Type                            | Default Value | Description                                            |
| --------- | ------------------------------- | ------------- | ------------------------------------------------------ |
| `columns` | `ReadonlyArray<TableColumn<T>>` | N/A           | Table column definitions mapped to keys in the `data`. |
| `data`    | `readonly T[]`                  | N/A           | Table data array to display.                           |

#### Input Bindings (optional):

| Input                  | Type                      | Default Value          | Description                                            |
| ---------------------- | ------------------------- | ---------------------- | ------------------------------------------------------ |
| `highlightOddRows`     | `boolean`                 | `false`                | Highlight odd rows.                                    |
| `initialSort`          | `TableSortChangeEvent<T>` | N/A                    | Initial sort configuration.                            |
| `maxSelectableRows`    | `number`                  | No limit               | Maximum number of selectable rows.                     |
| `placeholderEmptyData` | `string`                  | `N/A`                  | Placeholder text when no data is available for a cell. |
| `placeholderEmptyList` | `string`                  | `No items to display.` | Placeholder text when data array is empty.             |
| `placeholderLoading`   | `string`                  | `Loading...`           | Placeholder text when data is loading.                 |
| `rowClickEnabled`      | `boolean`                 | `false`                | Enable row click event.                                |
| `selectable`           | `boolean`                 | `false`                | Enable row selection.                                  |
| `stickyHeader`         | `boolean`                 | `false`                | Enable sticky table header.                            |
| `trackByFn`            | `function`                | Default `trackBy` (id) | Custom trackBy function for rows.                      |

#### Event Handling

| Event             | Type                                    | Description                                                 |
| ----------------- | --------------------------------------- | ----------------------------------------------------------- |
| `rowClick`        | `EventEmitter<T>`                       | Emits if a row is clicked when `rowClickEnabled` is true.   |
| `rowSelectChange` | `EventEmitter<readonly T[]>`            | Emits if a row selection changes when `selectable` is true. |
| `sortChange`      | `EventEmitter<TableSortChangeEvent<T>>` | Emits when sort changes.                                    |

#### Table Types

```typescript
// T = Your row data type (object)

interface TableColumn<T extends object> {
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

type SortDirection = 'asc' | 'desc' | '';

interface TableSortChangeEvent<T> {
  /** The direction of the sort, or null if cleared */
  direction: SortDirection | null;
  /** The column key being sorted */
  key: NestedKeysOfString<T> | string | null;
}

type TableTemplateReferenceObject<
  C = unknown, // Context type
  T = unknown, // Template type
> = {
  /** The context object passed to the template */
  context: C;
  /** The template reference to render */
  templateRef: import('@angular/core').TemplateRef<T>;
};

interface TableTemplateReferenceExpandableObject<
  C = unknown, // Context type
  T = unknown, // Template type
> extends TableTemplateReferenceObject<C, T> {
  /** Whether the detail row is expanded */
  isExpanded: boolean;
}
```

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Compatibility <a name="compatibility"></a>

| Angular version | @proangular/pro-table | Install                          |
| --------------- | --------------------- | -------------------------------- |
| v20             | v20.x.x               | ng add @proangular/pro-table@^20 |
| v19             | ------                | Untested                         |
| v18             | ------                | Untested                         |
| v17             | ------                | Untested                         |

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Contributions <a name="contributions"></a>

Please submit all issues, and feature requests here:
[https://github.com/ProAngular/pro-table/issues][url-new-issue]

Contribution:

1. Clone the repo and create a new branch:

- `git clone https://github.com/ProAngular/pro-table.git`
- `git checkout -b username/feature-or-bug-description`

2. Bump up the version of package in `package.json` and `package-lock.json`,
   commit all changes, push.

- `git add -A`
- `git commit -m "My commit message"`
- `git push origin username/feature-or-bug-description`

3. Submit code in published PR for review and approval. Add a good description
   and link any possible user stories or bugs.

- [Create a new pull request](https://github.com/ProAngular/pro-table/compare).

4. Allow CI actions to completely run and verify files.
5. Add/ping reviewers and await approval.

Thank you for any and all contributions!

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Licensing <a name="licensing"></a>

This project is licensed under the **MIT** License. See the
[LICENSE](LICENSE.md) file for the pertaining license text.

`SPDX-License-Identifier: MIT`

<p align="right">[ <a href="#index">Index</a> ]</p>

<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->
<!---------------------------------------------------------------------------->

## Wrapping Up <a name="wrapping-up"></a>

Thank you to the entire Angular team and community for such a great framework to
build upon. If you have any questions, please let me know by opening an issue
[here][url-new-issue].

| Type                                                                                                                                             | Info                                                           |
| :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| <img width="48" src="https://raw.githubusercontent.com/ProAngular/pro-table/refs/heads/main/.github/images/ng-icons/email.svg" />                | webmaster@codytolene.com                                       |
| <img width="48" src="https://raw.githubusercontent.com/ProAngular/pro-table/refs/heads/main/.github/images/simple-icons/github.svg" />           | https://github.com/sponsors/CodyTolene                         |
| <img width="48" src="https://raw.githubusercontent.com/ProAngular/pro-table/refs/heads/main/.github/images/simple-icons/buymeacoffee.svg" />     | https://www.buymeacoffee.com/codytolene                        |
| <img width="48" src="https://raw.githubusercontent.com/ProAngular/pro-table/refs/heads/main/.github/images/simple-icons/bitcoin-btc-logo.svg" /> | bc1qfx3lvspkj0q077u3gnrnxqkqwyvcku2nml86wmudy7yf2u8edmqq0a5vnt |

Fin. Happy programming friend!

Cody Tolene

<!-- LINKS -->

[img-info]:
  https://raw.githubusercontent.com/ProAngular/pro-table/refs/heads/main/.github/images/ng-icons/info.svg
[url-demo]: https://www.ProAngular.com/demos/pro-table
[url-example-table-code]: src/app/table-example/table-example.component.html
[url-new-issue]: https://github.com/ProAngular/pro-table/issues
[url-node-js]: https://nodejs.org/
