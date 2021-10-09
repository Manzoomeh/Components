import IGrid from "../grid/IGrid";
import ProcessManager from "./SourceManager";
import { SignalSourceCallback } from "../../type-alias";

export default class NoPaginate extends ProcessManager {
  constructor(owner: IGrid, onSignalSourceCallback: SignalSourceCallback) {
    super(owner, onSignalSourceCallback);
  }

  // public setSource(data: Array<GridRow>, options: IOffsetOptions) {
  //   this.owner.displayRows(data);
  // }
}
