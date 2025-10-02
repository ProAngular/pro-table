import { TableTemplateReferenceObject } from './table-template-reference-object';

export interface TableTemplateReferenceExpandableObject<
  C = unknown,
  T = unknown,
> extends TableTemplateReferenceObject<C, T> {
  isExpanded: boolean;
}
