import GridRow from "./GridRow";
import { IGridOptions } from "./IOptions";

export default interface IGrid {
  options: IGridOptions;
  displayCurrentRows(rows: GridRow[]): void;
}
