import { Primitive } from './primitives';

export type KeysOf<T> = { [P in keyof T]: P }[keyof T];

export type KeysOfString<T> = Extract<KeysOf<T>, string>;

export type NestedKeysOfString<T> = T extends Primitive
  ? never
  : T extends null | undefined
    ? ''
    :
        | KeysOfString<T>
        | {
            [P in keyof T & string]: `${P}.${NestedKeysOfString<
              NonNullable<T[P]>
            >}`;
          }[keyof T & string];

export type DeepNestedKeysOfString<T, P extends keyof T & string> =
  T[P] extends Array<infer Inner>
    ? `${P}.${NestedKeysOfString<Inner>}`
    : T[P] extends object
      ? `${P}.${NestedKeysOfString<T[P]>}`
      : never;
