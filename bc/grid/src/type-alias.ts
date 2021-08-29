import { IColumnInfo } from "./options/IOptions";

export type ISource = any[];

export type IDictionary<T> = { [key: string]: T };

export type ISortType = "asc" | "desc";

export type IGridColumnInfo = IColumnInfo & {
  type: ColumnType;
  name: string;
};

export type ISortInfo = {
  column: IGridColumnInfo;
  sort: ISortType;
};

export enum ColumnType {
  Data,
  Sort,
  Action,
}
