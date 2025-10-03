export type Primitive = string | number | boolean | undefined | null;

export type DefinedPrimitive = Exclude<Primitive, null | undefined>;
