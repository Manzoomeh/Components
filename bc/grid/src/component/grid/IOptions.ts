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
  source?: string | IFieldMakerCallback;
  title?: string;
  sort?: boolean;
  width?: string;
  filter?: boolean;
  cellMaker?: ICellMakerCallback;
};

export type ICellMakerCallback = (
  row: any,
  data: any,
  element: HTMLTableCellElement
) => string;

export type IRowMakerCallback = (
  row: any,
  element: HTMLTableRowElement
) => void;

export type IFieldMakerCallback = (row: any) => any;
