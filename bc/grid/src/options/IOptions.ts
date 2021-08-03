import { IDictionary } from "../type-alias";

export type IOptions = {
  columns: IDictionary<Column>;
};

export type Column = string | ColumnInfo;

export type ColumnInfo = {
  title: string;
};
