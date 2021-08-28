import { IOptions } from "./options/IOptions";

export default interface IGrid {
  options: IOptions;
  displayCurrentRows(): void;
}
