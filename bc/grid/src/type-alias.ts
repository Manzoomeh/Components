import { IColumnInfo } from "./component/grid/IOptions";
import { ColumnType } from "./enum";

export type IGridSource = any[];

export type IDictionary<T> = { [key: string]: T };

export type ISortType = "asc" | "desc";

export type IGridColumnInfo = IColumnInfo & {
  type: ColumnType;
};

export type ISortInfo = {
  column: IGridColumnInfo;
  sort: ISortType;
};
