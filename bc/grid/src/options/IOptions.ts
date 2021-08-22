import { IDictionary } from "../type-alias";

export type IOptions = {
  columns: IDictionary<Column>;
  filter?: boolean;
  pageSize?: number[];
  paging?: boolean;
};

export type Column = string | ColumnInfo;

export type ColumnInfo = {
  title?: string;
  sortable?: boolean;
};
