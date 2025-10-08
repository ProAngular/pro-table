import { ElementRef } from '@angular/core';

export function scrollTop(
  elementRef: ElementRef<HTMLElement>,
  { offset = 0 }: { offset?: number } = {},
): void {
  const topOfTableWithOffset =
    elementRef.nativeElement.getBoundingClientRect().top +
    window.scrollY -
    offset;
  window.scrollTo({ top: topOfTableWithOffset, behavior: 'smooth' });
}
