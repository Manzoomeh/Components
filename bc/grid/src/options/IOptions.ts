import { IDictionary } from "../type-alias";

export type IOptions = {
  columns: IDictionary<Column>;
  key?: string;
};

export type Column = string | ColumnInfo;

export type ColumnInfo = {
  title?: string;
  sortable?: boolean;
};

export type GridColumnInfo = ColumnInfo & {
  name: string;
};
