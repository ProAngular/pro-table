// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TableTemplateReferenceObject<
  C = unknown, // Context type
  T = unknown, // Template type
> = {
  /** The context object passed to the template */
  context: C;
  /** The template reference to render */
  templateRef: import('@angular/core').TemplateRef<T>;
};
