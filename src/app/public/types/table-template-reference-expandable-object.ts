import { TableTemplateReferenceObject } from './table-template-reference-object';

export interface TableTemplateReferenceExpandableObject<
  C = unknown, // Context type
  T = unknown, // Template type
> extends TableTemplateReferenceObject<C, T> {
  /** Whether the detail row is expanded */
  isExpanded: boolean;
}
