import { DateTime } from 'luxon';

import { Clipboard } from '@angular/cdk/clipboard';
import { ElementRef, TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { copyToClipboard } from './copy-to-clipboard';
import { getData } from './get-data';
import { getDate } from './get-date';
import { getNestedObjectData } from './get-nested-object-data';
import { getTypeOf } from './get-type-of';
import { jsonSafeReplacer } from './json-safe-replacer';
import { quickSort } from './quick-sort';

interface Person {
  active: boolean;
  address: { city: string } | null;
  age: number | null;
  name: string;
}

const person: Person = {
  active: true,
  address: { city: 'Austin' },
  age: 30,
  name: 'Cara',
};

describe('getNestedObjectData', () => {
  it('reads a top level value', () => {
    expect(getNestedObjectData(person, 'name')).toBe('Cara');
    expect(getNestedObjectData(person, 'age')).toBe(30);
  });

  it('reads a nested value', () => {
    expect(getNestedObjectData(person, 'address.city')).toBe('Austin');
  });

  it('returns null for a null value and a null parent', () => {
    const noAge: Person = { ...person, age: null };
    const noAddress: Person = { ...person, address: null };

    expect(getNestedObjectData(noAge, 'age')).toBeNull();
    expect(getNestedObjectData(noAddress, 'address.city')).toBeNull();
  });

  it('returns null when an optional field is missing from the row', () => {
    const noAge: Partial<Person> = { name: 'Cara' };
    const noAddress: Partial<Person> = { name: 'Cara' };

    expect(getNestedObjectData(noAge as Person, 'age')).toBeNull();
    expect(getNestedObjectData(noAddress as Person, 'address.city')).toBeNull();
    expect(getNestedObjectData(person, 'address.zip' as 'name')).toBeNull();
  });

  it('returns objects as they are', () => {
    expect(getNestedObjectData(person, 'address')).toBe(person.address);
  });
});

describe('getData', () => {
  it('returns strings and numbers as they are', () => {
    expect(getData(person, 'name', 'N/A')).toBe('Cara');
    expect(getData(person, 'age', 'N/A')).toBe(30);
  });

  it('turns zero into a string so it is not treated as empty', () => {
    expect(getData({ ...person, age: 0 }, 'age', 'N/A')).toBe('0');
  });

  it('turns booleans into True and False', () => {
    expect(getData(person, 'active', 'N/A')).toBe('True');
    expect(getData({ ...person, active: false }, 'active', 'N/A')).toBe(
      'False',
    );
  });

  it('uses the placeholder for null', () => {
    expect(getData({ ...person, age: null }, 'age', '--')).toBe('--');
  });

  it('returns dates and DateTime values untouched', () => {
    const date = new Date(2025, 0, 5);
    const dateTime = DateTime.local(2025, 1, 5);
    const row = { dateTime, date };

    expect(getData(row, 'date', 'N/A')).toBe(date);
    expect(getData(row, 'dateTime', 'N/A')).toBe(dateTime);
  });
});

describe('getDate and getTypeOf', () => {
  it('getDate returns only Date instances', () => {
    const date = new Date();
    expect(getDate(date)).toBe(date);
    expect(getDate('2025-01-05')).toBeNull();
    expect(getDate(DateTime.local())).toBeNull();
    expect(getDate(null)).toBeNull();
  });

  it('getTypeOf names dates, date times and falls back to typeof', () => {
    expect(getTypeOf(new Date())).toBe('date');
    expect(getTypeOf(DateTime.local())).toBe('datetime');
    expect(getTypeOf('a')).toBe('string');
    expect(getTypeOf(1)).toBe('number');
    expect(getTypeOf({})).toBe('object');
    expect(getTypeOf(null)).toBe('object');
    expect(getTypeOf(undefined)).toBe('undefined');
  });
});

describe('quickSort', () => {
  const rows = [{ v: 2 }, { v: 3 }, { v: 1 }];

  it('sorts ascending and descending without changing the input', () => {
    expect(quickSort(rows, 'v', 'asc').map((row) => row.v)).toEqual([1, 2, 3]);
    expect(quickSort(rows, 'v', 'desc').map((row) => row.v)).toEqual([3, 2, 1]);
    expect(rows.map((row) => row.v)).toEqual([2, 3, 1]);
  });

  it('sorts strings', () => {
    const names = [{ v: 'Bo' }, { v: 'Cara' }, { v: 'Abe' }];
    expect(quickSort(names, 'v', 'asc').map((row) => row.v)).toEqual([
      'Abe',
      'Bo',
      'Cara',
    ]);
  });

  it('puts null and undefined values last', () => {
    const values: Array<{ v: number | null | undefined }> = [
      { v: 2 },
      { v: null },
      { v: 1 },
      { v: undefined },
    ];

    expect(
      quickSort(values, 'v', 'asc')
        .map((row) => row.v)
        .slice(0, 2),
    ).toEqual([1, 2]);
    expect(
      quickSort(values, 'v', 'desc')
        .map((row) => row.v)
        .slice(0, 2),
    ).toEqual([2, 1]);
  });
});

describe('copyToClipboard', () => {
  it('copies text and returns the clipboard result', () => {
    const clipboard = TestBed.inject(Clipboard);
    const copy = vi.spyOn(clipboard, 'copy').mockReturnValue(true);

    expect(copyToClipboard('Cara', clipboard)).toBe(true);
    expect(copy).toHaveBeenCalledWith('Cara');

    copy.mockReturnValue(false);
    expect(copyToClipboard('Cara', clipboard)).toBe(false);
  });

  it('throws for an empty or blank string and does not copy', () => {
    const clipboard = TestBed.inject(Clipboard);
    const copy = vi.spyOn(clipboard, 'copy');

    expect(() => copyToClipboard('', clipboard)).toThrow(
      'Failed to copy empty string to the clipboard!',
    );
    expect(() => copyToClipboard('   ', clipboard)).toThrow();
    expect(copy).not.toHaveBeenCalled();
  });
});

describe('jsonSafeReplacer', () => {
  it('drops the keys that hold Angular internals', () => {
    for (const key of [
      'templateRef',
      'viewContainerRef',
      '__ngContext__',
      '_def',
      'blueprint',
    ]) {
      expect(jsonSafeReplacer(key, { a: 1 })).toBeUndefined();
    }
  });

  it('replaces TemplateRef, ElementRef and functions with labels', () => {
    const templateRef = Object.create(
      TemplateRef.prototype,
    ) as TemplateRef<void>;
    const elementRef = new ElementRef(document.createElement('div'));
    function named(): number {
      return 1;
    }
    const [anonymous] = [(): number => 2];

    expect(jsonSafeReplacer('k', templateRef)).toBe('[TemplateRef]');
    expect(jsonSafeReplacer('k', elementRef)).toBe('[ElementRef]');
    expect(jsonSafeReplacer('k', named)).toBe('[Function named]');
    expect(jsonSafeReplacer('k', anonymous)).toBe('[Function anonymous]');
  });

  it('passes other values through and works with JSON.stringify', () => {
    expect(jsonSafeReplacer('k', 'text')).toBe('text');
    expect(jsonSafeReplacer('k', 5)).toBe(5);
    expect(jsonSafeReplacer('k', null)).toBeNull();

    const value = { a: 1, nested: { b: 'two' }, templateRef: {} };
    expect(JSON.stringify(value, jsonSafeReplacer)).toBe(
      '{"a":1,"nested":{"b":"two"}}',
    );
  });
});
