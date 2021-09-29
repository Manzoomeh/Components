import { IDictionary, ISortType } from "../../type-alias";

export type FilterType = "none" | "simple" | "row";
export type HtmlDirection = "ltr" | "rtl";
export type IGridOptions = {
  columns: IDictionary<IColumn>;
  filter?: FilterType;
  paging?: number[];
  rowNumber?: string;
  defaultSort: string | ISortInfo;
  pageCount?: number;
  pageNumber?: number;
  sorting?: boolean;
  culture: {
    labels: IDictionary<string>;
  };
  rowMaker?: IRowMakerCallback;
  direction: HtmlDirection;
};

export type IColumn = string | IColumnInfo;

export type ISortInfo = {
  name: string;
  sort?: ISortType;
};

export type IColumnInfo = {
  filed?: string;
  title?: string;
  sort?: boolean;
  actions?: Array<IGridAction>;
  width?: string;
  filter?: boolean | IFilterOption;
  cellMaker?: ICellMakerCallback;
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
export type ICellMakerCallback = (
  row: any,
  data: any,
  element: HTMLTableCellElement
) => string;

export type IRowMakerCallback = (
  row: any,
  element: HTMLTableRowElement
) => void;
