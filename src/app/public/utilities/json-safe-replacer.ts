import { ElementRef, TemplateRef } from '@angular/core';

export const jsonSafeReplacer = (() => {
  const seen = new WeakSet<object>();
  const dropKeys = new Set([
    'templateRef',
    'viewContainerRef',
    '__ngContext__',
    '_def',
    'blueprint',
  ]);

  return function (_key: string, value: unknown): unknown {
    if (dropKeys.has(_key)) {
      return undefined;
    }

    if (value instanceof TemplateRef) {
      return '[TemplateRef]';
    }

    if (typeof ElementRef !== 'undefined' && value instanceof ElementRef) {
      return '[ElementRef]';
    }

    if (typeof value === 'function') {
      return `[Function ${value.name || 'anonymous'}]`;
    }

    if (value && typeof value === 'object') {
      if (seen.has(value)) {
        return '[Circular]';
      }

      seen.add(value);
    }

    return value;
  };
})();
