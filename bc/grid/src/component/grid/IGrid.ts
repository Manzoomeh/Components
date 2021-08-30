import { IGridOptions } from "./IOptions";

export default interface IGrid {
  options: IGridOptions;
  displayCurrentRows(): void;
}
