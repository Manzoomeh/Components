import GridRow from "./GridRow";
import { IGridOptions } from "./IOptions";

export default interface IGrid {
  options: IGridOptions;
  displayRows(rows: GridRow[]): void;
}
