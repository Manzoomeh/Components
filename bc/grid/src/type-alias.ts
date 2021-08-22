import { ColumnInfo } from "./options/IOptions";

export type Source = any[];
export type IDictionary<T> = { [key: string]: T };
export type GridColumnInfo = ColumnInfo & {
  name: string;
};

export type SortType = "asc" | "desc";

export type SortInfo = {
  columnName: string;
  sortType: SortType;
};
