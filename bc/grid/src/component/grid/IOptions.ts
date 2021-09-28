import { IDictionary, ISortType } from "../../type-alias";

export type FilterType = "none" | "simple" | "row";
export type IGridOptions = {
  columns: IDictionary<IColumn>;
  filter?: FilterType;
  pageSize?: number[];
  paging?: boolean;
  rowNumber?: string;
  defaultSort: string | ISortInfo;
  pageCount?: number;
  sorting?: boolean;
  culture: {
    labels: IDictionary<string>;
  };
};

export type IColumn = string | IColumnInfo;

export type ISortInfo = {
  name: string;
  sort?: ISortType;
};

export type IColumnInfo = {
  title?: string;
  sort?: boolean;
  actions?: Array<IGridAction>;
  width?: string;
  filter?: boolean | IFilterOption;
};

export type IFilterOption = {};
export type IGridAction = {
  url?: string | IActionUrlMakerCallback;
  action?: IActionCallback;
  label?: string;
  imageUrl?: string;
};

export type IActionCallback = (any: any, element: HTMLTableRowElement) => void;

export type IActionUrlMakerCallback = (any: any) => string;
