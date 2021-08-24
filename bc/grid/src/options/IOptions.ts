import { IDictionary } from "../type-alias";

export type IOptions = {
  columns: IDictionary<Column>;
  filter?: boolean;
  pageSize?: number[];
  paging?: boolean;
  rowNumber?: boolean | GridColumnInfo;
};

export type Column = string | ColumnInfo;

export type ColumnInfo = {
  title?: string;
  sort?: boolean;
};

export type GridColumnInfo = ColumnInfo & {
  name: string;
};
