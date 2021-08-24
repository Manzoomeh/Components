import { GridColumnInfo } from "./options/IOptions";

export type Source = any[];

export type IDictionary<T> = { [key: string]: T };

export type SortType = "asc" | "desc";

export type SortInfo = {
  column: GridColumnInfo;
  sort: SortType;
};
