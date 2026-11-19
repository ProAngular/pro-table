import { DateTime } from 'luxon';

import { DateTimePipe } from './date-time.pipe';

describe('DateTimePipe', () => {
  const pipe = new DateTimePipe();

  it('formats with MM/dd/yyyy by default', () => {
    expect(pipe.transform(DateTime.local(2025, 1, 5))).toBe('01/05/2025');
  });

  it('formats with a given format', () => {
    const value = DateTime.local(2025, 1, 5, 13, 30);

    expect(pipe.transform(value, 'MM/dd/yyyy, hh:mm a')).toBe(
      '01/05/2025, 01:30 PM',
    );
    expect(pipe.transform(value, 'yyyy-MM-dd')).toBe('2025-01-05');
    expect(pipe.transform(value, 'hh:mm')).toBe('01:30');
    expect(pipe.transform(value, 'yyyy')).toBe('2025');
  });

  it('returns an empty string for null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('returns an empty string for values that are not a DateTime', () => {
    expect(pipe.transform('2025-01-05')).toBe('');
    expect(pipe.transform(new Date(2025, 0, 5))).toBe('');
    expect(pipe.transform(1736035200000)).toBe('');
    expect(pipe.transform({})).toBe('');
  });
});
