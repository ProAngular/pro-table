// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TableTemplateReferenceObject<C = unknown, T = unknown> = {
  context: C;
  templateRef: import('@angular/core').TemplateRef<T>;
};
