import { IDictionary, SortType } from "../type-alias";

export type IOptions = {
  columns: IDictionary<Column>;
  filter?: boolean;
  pageSize?: number[];
  paging?: boolean;
  rowNumber?: boolean | GridColumnInfo;
  defaultSort: string | SortInfo;
  pageCount?: number;
};

export type Column = string | ColumnInfo;

export type SortInfo = {
  name: string;
  sort?: SortType;
};

export type ColumnInfo = {
  title?: string;
  sort?: boolean;
};

export type GridColumnInfo = ColumnInfo & {
  name: string;
};
