import { IDictionary, ISortType } from "../../type-alias";

export type IGridOptions = {
  columns: IDictionary<IColumn>;
  filter?: boolean;
  pageSize?: number[];
  paging?: boolean;
  rowNumber?: string;
  defaultSort: string | ISortInfo;
  pageCount?: number;
  sorting?: boolean;
};

export type IColumn = string | IColumnInfo;

export type ISortInfo = {
  name: string;
  sort?: ISortType;
};

export type IColumnInfo = {
  title?: string;
  sort?: boolean;
};
