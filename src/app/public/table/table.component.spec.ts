import { DateTime } from 'luxon';

import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  TestHostComponent,
  TestRow,
  bodyRows,
  createRows,
  root,
  select,
  selectAll,
  settle,
  textOf,
} from '../pro-table.testing';

type Fixture = ComponentFixture<TestHostComponent>;

interface Created {
  fixture: Fixture;
  host: TestHostComponent;
}

async function create(
  setup?: (host: TestHostComponent) => void,
): Promise<Created> {
  TestBed.configureTestingModule({ imports: [TestHostComponent] });
  const fixture = TestBed.createComponent(TestHostComponent);
  setup?.(fixture.componentInstance);
  await settle(fixture);
  return { fixture, host: fixture.componentInstance };
}

const headerCells = (fixture: Fixture): HTMLElement[] =>
  selectAll(fixture, 'tr.mat-mdc-header-row > *');

const bodyRowElements = (fixture: Fixture): HTMLElement[] =>
  selectAll(fixture, 'tr.mat-mdc-row:not(.expandable-row)');

const headerCheckbox = (fixture: Fixture): HTMLInputElement =>
  select<HTMLInputElement>(fixture, 'th mat-checkbox input');

const rowCheckboxes = (fixture: Fixture): HTMLInputElement[] =>
  selectAll<HTMLInputElement>(fixture, 'td mat-checkbox input');

const checkState = (input: HTMLInputElement): string => {
  if (input.indeterminate) {
    return 'mixed';
  }
  return input.checked ? 'checked' : 'unchecked';
};

const names = (fixture: Fixture): string[] =>
  bodyRows(fixture).map(([name]) => name);

const extraRow = (): TestRow => ({
  active: true,
  address: { city: 'Denver' },
  age: 41,
  badge: null,
  details: null,
  id: 4,
  joined: null,
  name: 'Dee',
});

describe('TableComponent', () => {
  describe('rendering', () => {
    it('renders a header cell per column and a row per data item', async () => {
      const { fixture } = await create();

      expect(headerCells(fixture).map(textOf)).toEqual([
        'Name',
        'City',
        'Age',
        'Active',
      ]);
      expect(bodyRows(fixture)).toEqual([
        ['Cara', 'Austin', '30', 'True'],
        ['Abe', 'Boston', '0', 'False'],
        ['Bo', 'Chicago', 'N/A', 'True'],
      ]);
    });

    it('updates the rows when data changes', async () => {
      const { fixture, host } = await create();

      host.data.set(createRows().slice(0, 1));
      await settle(fixture);

      expect(names(fixture)).toEqual(['Cara']);
    });

    it('updates the header when columns change', async () => {
      const { fixture, host } = await create();

      host.columns.set([{ key: 'name', label: 'Person' }]);
      await settle(fixture);

      expect(headerCells(fixture).map(textOf)).toEqual(['Person']);
      expect(names(fixture)).toEqual(['Cara', 'Abe', 'Bo']);
    });

    it('formats DateTime and Date values and uses the placeholder for null', async () => {
      const { fixture, host } = await create();
      const [first, second, third] = createRows();
      host.columns.set([{ key: 'joined', label: 'Joined' }]);
      host.data.set([
        { ...first!, joined: DateTime.local(2025, 1, 5, 13, 30) },
        { ...second!, joined: new Date(2025, 0, 5) },
        { ...third!, joined: null },
      ]);
      await settle(fixture);

      expect(bodyRows(fixture)).toEqual([
        ['01/05/2025, 01:30 PM'],
        ['01/05/2025'],
        ['N/A'],
      ]);
      expect(select(fixture, 'td span[title]').title).toMatch(
        /^01\/05\/2025, 01:30 PM \(.+\)$/,
      );
    });

    it('renders a template reference object in the cell', async () => {
      const { fixture, host } = await create();
      host.columns.set([{ key: 'badge', label: 'Badge' }]);
      host.data.set(
        createRows().map((row) =>
          row.id === 1
            ? {
                ...row,
                badge: {
                  context: { label: 'VIP' },
                  templateRef: host.badgeTemplate(),
                },
              }
            : row,
        ),
      );
      await settle(fixture);

      expect(select(fixture, 'td b').textContent).toBe('VIP');
      expect(selectAll(fixture, 'button.expandable-row-button')).toHaveLength(
        0,
      );
      expect(bodyRows(fixture).map(([cell]) => cell)).toEqual([
        'VIP',
        'N/A',
        'N/A',
      ]);
    });
  });

  describe('placeholders', () => {
    it.each([null, undefined])(
      'shows the loading placeholder instead of the table when data is %s',
      async (value) => {
        const { fixture } = await create((host) => host.data.set(value));

        expect(textOf(select(fixture, 'p.loading'))).toBe('Loading...');
        expect(root(fixture).querySelector('table')).toBeNull();
      },
    );

    it('uses placeholderLoading for the loading text', async () => {
      const { fixture } = await create((host) => {
        host.data.set(null);
        host.placeholderLoading.set('Fetching people...');
      });

      expect(textOf(select(fixture, 'p.loading'))).toBe('Fetching people...');
    });

    it('renders the table once data arrives', async () => {
      const { fixture, host } = await create((h) => h.data.set(null));

      host.data.set(createRows());
      await settle(fixture);

      expect(root(fixture).querySelector('p.loading')).toBeNull();
      expect(names(fixture)).toEqual(['Cara', 'Abe', 'Bo']);
    });

    it('shows placeholderEmptyList for an empty list', async () => {
      const { fixture } = await create((host) => host.data.set([]));

      expect(textOf(select(fixture, 'tr.empty td'))).toBe(
        'No items to display.',
      );
      expect(root(fixture).querySelector('p.loading')).toBeNull();
    });

    it('uses a custom placeholderEmptyList', async () => {
      const { fixture } = await create((host) => {
        host.data.set([]);
        host.placeholderEmptyList.set('Nobody here.');
      });

      expect(textOf(select(fixture, 'tr.empty td'))).toBe('Nobody here.');
    });

    it('uses placeholderEmptyData for null values', async () => {
      const { fixture } = await create((host) =>
        host.placeholderEmptyData.set('--'),
      );

      expect(bodyRows(fixture)[2]).toEqual(['Bo', 'Chicago', '--', 'True']);
    });
  });

  describe('layout options', () => {
    it('applies highlight-odd-rows and the odd and even row classes', async () => {
      const { fixture, host } = await create();
      const element = select(fixture, 'pro-table');
      expect(element.classList.contains('highlight-odd-rows')).toBe(false);

      host.highlightOddRows.set(true);
      await settle(fixture);

      expect(element.classList.contains('highlight-odd-rows')).toBe(true);
      expect(
        bodyRowElements(fixture).map((row) =>
          row.classList.contains('odd') ? 'odd' : 'even',
        ),
      ).toEqual(['odd', 'even', 'odd']);
    });

    it('makes the header sticky only when stickyHeader is set', async () => {
      const { fixture, host } = await create();
      // The CDK always marks the hidden, empty <tfoot> as sticky, so only the
      // header cells say anything about stickyHeader.
      const stickyHeaderCells = (): HTMLElement[] =>
        selectAll(fixture, 'th.mat-mdc-table-sticky');
      expect(stickyHeaderCells()).toHaveLength(0);

      host.stickyHeader.set(true);
      await settle(fixture);

      expect(stickyHeaderCells()).toHaveLength(headerCells(fixture).length);

      host.stickyHeader.set(false);
      await settle(fixture);

      expect(stickyHeaderCells()).toHaveLength(0);
    });
  });

  describe('row click', () => {
    it('emits rowClick with the row when a row is clicked', async () => {
      const { fixture, host } = await create((h) =>
        h.rowClickEnabled.set(true),
      );

      expect(select(fixture, 'pro-table').classList.contains('clickable')).toBe(
        true,
      );

      bodyRowElements(fixture)[1]?.click();

      expect(host.rowClicks).toEqual([createRows()[1]]);
    });

    it('emits once when a cell is clicked', async () => {
      const { fixture, host } = await create((h) =>
        h.rowClickEnabled.set(true),
      );

      bodyRowElements(fixture)[0]?.querySelector('td')?.click();

      expect(host.rowClicks).toEqual([createRows()[0]]);
    });

    it('emits nothing when rowClickEnabled is false', async () => {
      const { fixture, host } = await create();

      expect(select(fixture, 'pro-table').classList.contains('clickable')).toBe(
        false,
      );

      bodyRowElements(fixture)[0]?.click();
      bodyRowElements(fixture)[0]?.querySelector('td')?.click();

      expect(host.rowClicks).toEqual([]);
    });

    it('copies a copyable cell instead of emitting rowClick', async () => {
      const { fixture, host } = await create((h) => {
        h.rowClickEnabled.set(true);
        h.columns.set([{ copyable: true, key: 'name', label: 'Name' }]);
      });
      const copy = vi
        .spyOn(TestBed.inject(Clipboard), 'copy')
        .mockReturnValue(true);
      const open = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

      bodyRowElements(fixture)[0]?.querySelector('td')?.click();

      expect(copy).toHaveBeenCalledWith('Cara');
      expect(open).toHaveBeenCalledWith(
        'Copied "Cara" to clipboard!',
        'Close',
        {
          duration: 3000,
        },
      );
      expect(host.rowClicks).toEqual([]);
    });

    it('tells the user when copying fails', async () => {
      const { fixture } = await create((h) =>
        h.columns.set([{ copyable: true, key: 'name', label: 'Name' }]),
      );
      vi.spyOn(TestBed.inject(Clipboard), 'copy').mockReturnValue(false);
      const open = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

      bodyRowElements(fixture)[0]?.querySelector('td')?.click();

      expect(open).toHaveBeenCalledWith(
        'Failed to copy "Cara" to clipboard!',
        'Close',
        { duration: 3000 },
      );
    });
  });

  describe('selection', () => {
    it('has no checkboxes unless selectable is set', async () => {
      const { fixture, host } = await create();
      expect(selectAll(fixture, 'mat-checkbox')).toHaveLength(0);
      expect(headerCells(fixture)).toHaveLength(4);

      host.selectable.set(true);
      await settle(fixture);

      expect(headerCells(fixture)).toHaveLength(5);
      expect(rowCheckboxes(fixture)).toHaveLength(3);
    });

    it('selects and deselects a single row', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));

      rowCheckboxes(fixture)[1]?.click();
      await settle(fixture);

      expect(host.selections).toEqual([[createRows()[1]]]);
      expect(rowCheckboxes(fixture).map(checkState)).toEqual([
        'unchecked',
        'checked',
        'unchecked',
      ]);
      expect(checkState(headerCheckbox(fixture))).toBe('mixed');

      rowCheckboxes(fixture)[1]?.click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual([]);
      expect(checkState(headerCheckbox(fixture))).toBe('unchecked');
    });

    it('does not emit rowClick when a row checkbox is clicked', async () => {
      const { fixture, host } = await create((h) => {
        h.selectable.set(true);
        h.rowClickEnabled.set(true);
      });

      rowCheckboxes(fixture)[0]?.click();

      expect(host.rowClicks).toEqual([]);
      expect(host.selections).toHaveLength(1);
    });

    it('selects all rows and deselects all rows from the header', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));

      headerCheckbox(fixture).click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual(createRows());
      expect(checkState(headerCheckbox(fixture))).toBe('checked');
      expect(rowCheckboxes(fixture).every((box) => box.checked)).toBe(true);

      headerCheckbox(fixture).click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual([]);
      expect(checkState(headerCheckbox(fixture))).toBe('unchecked');
      expect(rowCheckboxes(fixture).some((box) => box.checked)).toBe(false);
    });

    it('checks the header once every row is selected one by one', async () => {
      const { fixture } = await create((h) => h.selectable.set(true));

      for (const box of rowCheckboxes(fixture)) {
        box.click();
      }
      await settle(fixture);

      expect(checkState(headerCheckbox(fixture))).toBe('checked');
    });

    it('clears the selection with clearSelected()', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));
      headerCheckbox(fixture).click();
      await settle(fixture);

      host.table().clearSelected();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual([]);
      expect(checkState(headerCheckbox(fixture))).toBe('unchecked');
      expect(rowCheckboxes(fixture).some((box) => box.checked)).toBe(false);
    });

    it('keeps the all-selected state correct when data changes', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));
      headerCheckbox(fixture).click();
      await settle(fixture);
      expect(checkState(headerCheckbox(fixture))).toBe('checked');

      host.data.set([...createRows().slice(0, 2), extraRow()]);
      await settle(fixture);

      expect(checkState(headerCheckbox(fixture))).toBe('mixed');
      expect(rowCheckboxes(fixture).map(checkState)).toEqual([
        'checked',
        'checked',
        'unchecked',
      ]);

      host.data.set(createRows());
      await settle(fixture);

      expect(checkState(headerCheckbox(fixture))).toBe('checked');

      host.data.set([]);
      await settle(fixture);

      expect(checkState(headerCheckbox(fixture))).not.toBe('checked');
    });

    it('selects every row of the new data after the data changes', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));
      host.data.set([extraRow()]);
      await settle(fixture);

      headerCheckbox(fixture).click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual([extraRow()]);
      expect(checkState(headerCheckbox(fixture))).toBe('checked');
    });

    it('keeps a selection across new row objects with the same id', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));
      headerCheckbox(fixture).click();
      await settle(fixture);
      const replaced = createRows();

      host.data.set(replaced);
      await settle(fixture);
      expect(rowCheckboxes(fixture).every((box) => box.checked)).toBe(true);

      rowCheckboxes(fixture)[0]?.click();

      const last = host.selections.at(-1) ?? [];
      expect(last).toHaveLength(2);
      expect(last.every((row) => replaced.includes(row))).toBe(true);
    });
  });

  describe('maxSelectableRows', () => {
    it('disables the unselected checkboxes at the limit', async () => {
      const { fixture, host } = await create((h) => {
        h.selectable.set(true);
        h.maxSelectableRows.set(2);
      });

      rowCheckboxes(fixture)[0]?.click();
      rowCheckboxes(fixture)[1]?.click();
      await settle(fixture);

      expect(rowCheckboxes(fixture).map((box) => box.disabled)).toEqual([
        false,
        false,
        true,
      ]);

      rowCheckboxes(fixture)[2]?.click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual(createRows().slice(0, 2));

      rowCheckboxes(fixture)[0]?.click();
      await settle(fixture);

      expect(rowCheckboxes(fixture)[2]?.disabled).toBe(false);
    });

    it('stops select all at the limit and tells the user', async () => {
      const { fixture, host } = await create((h) => {
        h.selectable.set(true);
        h.maxSelectableRows.set(2);
      });
      const open = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

      headerCheckbox(fixture).click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual(createRows().slice(0, 2));
      expect(open).toHaveBeenCalledWith(
        'You can only select up to 2 rows.',
        'Close',
        { duration: 3000 },
      );
      expect(checkState(headerCheckbox(fixture))).toBe('mixed');

      headerCheckbox(fixture).click();
      await settle(fixture);

      expect(host.selections.at(-1)).toEqual([]);
    });

    it('reads a numeric string as a number', async () => {
      const { host } = await create((h) => h.maxSelectableRows.set('2'));

      expect(host.table().maxSelectableRows()).toBe(2);
    });

    it.each([null, undefined, 'abc', '', {}])(
      'maps %j to null and applies no limit',
      async (value) => {
        const { fixture, host } = await create((h) => {
          h.selectable.set(true);
          h.maxSelectableRows.set(value);
        });
        expect(host.table().maxSelectableRows()).toBeNull();

        headerCheckbox(fixture).click();
        await settle(fixture);

        expect(host.selections.at(-1)).toEqual(createRows());
        expect(rowCheckboxes(fixture).some((box) => box.disabled)).toBe(false);
      },
    );
  });

  describe('sorting', () => {
    it('emits sortChange with a TableSortChangeEvent on a header click', async () => {
      const { fixture, host } = await create();
      const nameHeader = headerCells(fixture)[0];

      nameHeader?.click();
      nameHeader?.click();
      nameHeader?.click();

      expect(host.sorts).toEqual([
        { direction: 'asc', key: 'name' },
        { direction: 'desc', key: 'name' },
        { direction: null, key: null },
      ]);
    });

    it('emits the sortKey when a column has one', async () => {
      const { fixture, host } = await create();

      headerCells(fixture)[1]?.click();

      expect(host.sorts).toEqual([{ direction: 'asc', key: 'cityName' }]);
    });

    it('does not emit for a column that is not sortable', async () => {
      const { fixture, host } = await create();

      headerCells(fixture)[2]?.click();

      expect(host.sorts).toEqual([]);
    });

    it('applies initialSort on the first render', async () => {
      const { fixture, host } = await create((h) =>
        h.initialSort.set({ direction: 'desc', key: 'name' }),
      );

      expect(host.sorts).toEqual([{ direction: 'desc', key: 'name' }]);
      expect(headerCells(fixture)[0]?.getAttribute('aria-sort')).toBe(
        'descending',
      );
    });

    it('applies initialSort when the data arrives after the first render', async () => {
      const { fixture, host } = await create((h) => {
        h.data.set(null);
        h.initialSort.set({ direction: 'asc', key: 'name' });
      });
      expect(host.sorts).toEqual([]);

      host.data.set(createRows());
      await settle(fixture);

      expect(host.sorts).toEqual([{ direction: 'asc', key: 'name' }]);
      expect(headerCells(fixture)[0]?.getAttribute('aria-sort')).toBe(
        'ascending',
      );
      expect(headerCells(fixture)[1]?.getAttribute('aria-sort')).toBe('none');
    });

    it('does not emit on the first render without initialSort', async () => {
      const { host } = await create();

      expect(host.sorts).toEqual([]);
    });

    it('changes the row order when the consumer sorts the data', async () => {
      const { fixture, host } = await create((h) => h.autoSort.set(true));
      expect(names(fixture)).toEqual(['Cara', 'Abe', 'Bo']);

      headerCells(fixture)[0]?.click();
      await settle(fixture);
      expect(names(fixture)).toEqual(['Abe', 'Bo', 'Cara']);

      headerCells(fixture)[0]?.click();
      await settle(fixture);
      expect(names(fixture)).toEqual(['Cara', 'Bo', 'Abe']);
      expect(host.sorts).toHaveLength(2);
    });
  });

  describe('expandable rows', () => {
    async function createExpandable(): Promise<Created> {
      const created = await create((h) => h.rowClickEnabled.set(true));
      const { fixture, host } = created;
      host.columns.set([
        { key: 'name', label: 'Name' },
        { key: 'details', label: 'More' },
      ]);
      host.data.set(
        createRows().map((row) =>
          row.id === 1
            ? row
            : {
                ...row,
                details: {
                  context: { name: row.name },
                  isExpanded: false,
                  templateRef: host.detailTemplate(),
                },
              },
        ),
      );
      await settle(fixture);
      return created;
    }

    const buttons = (fixture: Fixture): HTMLElement[] =>
      selectAll(fixture, 'button.expandable-row-button');

    it('renders an expand button for each expandable object', async () => {
      const { fixture } = await createExpandable();

      expect(bodyRows(fixture)).toEqual([
        ['Cara', 'N/A'],
        ['Abe', 'Expand'],
        ['Bo', 'Expand'],
      ]);
      expect(selectAll(fixture, '.expandable-row-details.open')).toHaveLength(
        0,
      );
    });

    it('opens and closes the detail row without emitting rowClick', async () => {
      const { fixture, host } = await createExpandable();

      buttons(fixture)[0]?.click();
      await settle(fixture);

      expect(textOf(buttons(fixture)[0]!)).toBe('Collapse');
      const open = selectAll(fixture, '.expandable-row-details.open');
      expect(open).toHaveLength(1);
      expect(textOf(open[0]!)).toBe('Details for Abe');

      buttons(fixture)[0]?.click();
      await settle(fixture);

      expect(textOf(buttons(fixture)[0]!)).toBe('Expand');
      expect(selectAll(fixture, '.expandable-row-details.open')).toHaveLength(
        0,
      );
      expect(host.rowClicks).toEqual([]);
    });

    it('keeps one detail row open at a time', async () => {
      const { fixture } = await createExpandable();

      buttons(fixture)[0]?.click();
      await settle(fixture);
      buttons(fixture)[1]?.click();
      await settle(fixture);

      expect(buttons(fixture).map(textOf)).toEqual(['Expand', 'Collapse']);
      const open = selectAll(fixture, '.expandable-row-details.open');
      expect(open).toHaveLength(1);
      expect(textOf(open[0]!)).toBe('Details for Bo');
    });
  });

  describe('trackByFn', () => {
    it('defaults to the id of the row', async () => {
      const { host } = await create();
      const [first] = createRows();

      expect(host.table().trackByFn()(0, first!)).toBe(1);
    });

    it('keys the selection by a custom trackByFn', async () => {
      const { fixture, host } = await create((h) => {
        h.selectable.set(true);
        h.trackByFn.set((_index, item) => item.name);
      });
      rowCheckboxes(fixture)[0]?.click();
      await settle(fixture);

      host.data.set(createRows().map((row) => ({ ...row, id: row.id + 10 })));
      await settle(fixture);

      expect(rowCheckboxes(fixture).map(checkState)).toEqual([
        'checked',
        'unchecked',
        'unchecked',
      ]);
    });

    it('loses the selection when the default key changes', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));
      rowCheckboxes(fixture)[0]?.click();
      await settle(fixture);

      host.data.set(createRows().map((row) => ({ ...row, id: row.id + 10 })));
      await settle(fixture);

      expect(rowCheckboxes(fixture).some((box) => box.checked)).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('uses th elements for every header cell', async () => {
      const { fixture } = await create((h) => h.selectable.set(true));

      const cells = headerCells(fixture);
      expect(cells).toHaveLength(5);
      expect(cells.every((cell) => cell.tagName === 'TH')).toBe(true);
      expect(root(fixture).querySelector('table')).not.toBeNull();
    });

    it('gives every selection checkbox an accessible name', async () => {
      const { fixture } = await create((h) => h.selectable.set(true));

      expect(headerCheckbox(fixture).getAttribute('aria-label')).toBe(
        'Select all rows',
      );
      expect(
        rowCheckboxes(fixture).map((box) => box.getAttribute('aria-label')),
      ).toEqual(['Select row 1', 'Select row 2', 'Select row 3']);
    });

    it('keeps row checkbox names unique after the data changes', async () => {
      const { fixture, host } = await create((h) => h.selectable.set(true));

      host.data.set([extraRow()]);
      await settle(fixture);

      expect(
        rowCheckboxes(fixture).map((box) => box.getAttribute('aria-label')),
      ).toEqual(['Select row 1']);
    });

    it('reports the sort state in aria-sort on a sortable header', async () => {
      const { fixture } = await create();
      const nameHeader = headerCells(fixture)[0];
      expect(nameHeader?.getAttribute('aria-sort')).toBe('none');

      nameHeader?.click();
      await settle(fixture);
      expect(nameHeader?.getAttribute('aria-sort')).toBe('ascending');

      nameHeader?.click();
      await settle(fixture);
      expect(nameHeader?.getAttribute('aria-sort')).toBe('descending');

      nameHeader?.click();
      await settle(fixture);
      expect(nameHeader?.getAttribute('aria-sort')).toBe('none');
    });
  });
});
