import { TemplateRef } from '@angular/core';

import {
  isNonEmptyObject,
  isNonEmptyPrimitive,
  isNonEmptyString,
  isNonEmptyValue,
  isPrimitive,
  isString,
  isTableTemplateRefExpandableObject,
  isTableTemplateRefObject,
  isWhitespaceString,
} from './type-checks';

describe('type checks', () => {
  const templateRef = Object.create(TemplateRef.prototype) as TemplateRef<void>;

  it('isNonEmptyObject accepts only objects with keys', () => {
    expect(isNonEmptyObject({ a: 1 })).toBe(true);
    expect(isNonEmptyObject([1])).toBe(true);
    expect(isNonEmptyObject({})).toBe(false);
    expect(isNonEmptyObject([])).toBe(false);
    expect(isNonEmptyObject(null)).toBe(false);
    expect(isNonEmptyObject('text')).toBe(false);
  });

  it('isPrimitive matches primitives, null and undefined', () => {
    for (const value of ['a', 1, true, null, undefined, Symbol('s'), 1n]) {
      expect(isPrimitive(value)).toBe(true);
    }
    for (const value of [{}, [], () => 1, new Date()]) {
      expect(isPrimitive(value)).toBe(false);
    }
  });

  it('isNonEmptyPrimitive excludes null and undefined', () => {
    expect(isNonEmptyPrimitive('a')).toBe(true);
    expect(isNonEmptyPrimitive(0)).toBe(true);
    expect(isNonEmptyPrimitive(false)).toBe(true);
    expect(isNonEmptyPrimitive(null)).toBe(false);
    expect(isNonEmptyPrimitive(undefined)).toBe(false);
    expect(isNonEmptyPrimitive({})).toBe(false);
  });

  it('isString matches string primitives and String objects', () => {
    expect(isString('a')).toBe(true);
    expect(isString('')).toBe(true);
    const wrapped: unknown = Object('a');
    expect(isString(wrapped)).toBe(true);
    expect(isString(1)).toBe(false);
    expect(isString(null)).toBe(false);
  });

  it('isWhitespaceString is true for blank strings only', () => {
    expect(isWhitespaceString('')).toBe(true);
    expect(isWhitespaceString('  \n\t')).toBe(true);
    expect(isWhitespaceString(' a ')).toBe(false);
    expect(isWhitespaceString(1)).toBe(false);
    expect(isWhitespaceString(null)).toBe(false);
  });

  it('isNonEmptyString rejects blank strings and non strings', () => {
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(1)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
  });

  it('isNonEmptyValue rejects only null and undefined', () => {
    expect(isNonEmptyValue(0)).toBe(true);
    expect(isNonEmptyValue('')).toBe(true);
    expect(isNonEmptyValue(false)).toBe(true);
    expect(isNonEmptyValue(null)).toBe(false);
    expect(isNonEmptyValue(undefined)).toBe(false);
  });

  it('isTableTemplateRefObject needs context and templateRef but no isExpanded', () => {
    expect(isTableTemplateRefObject({ context: {}, templateRef })).toBe(true);
    expect(
      isTableTemplateRefObject({ context: {}, isExpanded: false, templateRef }),
    ).toBe(false);
    expect(isTableTemplateRefObject({ context: {} })).toBe(false);
    expect(isTableTemplateRefObject({ templateRef })).toBe(false);
    expect(isTableTemplateRefObject(null)).toBe(false);
    expect(isTableTemplateRefObject('text')).toBe(false);
  });

  it('isTableTemplateRefExpandableObject also needs isExpanded', () => {
    expect(
      isTableTemplateRefExpandableObject({
        context: {},
        isExpanded: false,
        templateRef,
      }),
    ).toBe(true);
    expect(
      isTableTemplateRefExpandableObject({ context: {}, templateRef }),
    ).toBe(false);
    expect(isTableTemplateRefExpandableObject(null)).toBe(false);
    expect(isTableTemplateRefExpandableObject(1)).toBe(false);
  });
});
