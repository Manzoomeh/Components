import { SignalSourceCallback } from "../../type-alias";
import GridRow from "../grid/GridRow";
import IGrid from "../grid/IGrid";
import { IOffsetOptions } from "../grid/IOptions";
import PaginateBaseProcess from "./PaginateBaseProcess";

export default class ServerProcess extends PaginateBaseProcess {
  constructor(
    owner: IGrid,
    pageSizeContainer: HTMLDivElement,
    pagingContainer: HTMLDivElement,
    onSignalSourceCallback: SignalSourceCallback
  ) {
    super(owner, pageSizeContainer, pagingContainer, onSignalSourceCallback);
  }

  setSource(rows: GridRow[], options: IOffsetOptions) {
    this.originalData = rows;
    this.options = options;
    rows.forEach((row, i) => row.setOrder(i + (this.options?.from ?? 0)));
    this.displayRows(rows);
  }

  protected displayRows(rows: Array<GridRow>): void {
    this.filteredData = rows;
    this.totalRows = this.options.total;
    this.pageNumber = Math.floor(this.options.from / this.pageSize);
    this.totalPage =
      Math.floor(this.totalRows / this.pageSize) +
      (Math.ceil(this.totalRows % this.pageSize) > 0 ? 1 : 0);
    this.updatePaging();
    super.displayCurrentRows();
  }

  protected displayCurrentRows(): void {
    this.tryLoadData();
  }

  public updateUI(): void {
    this.tryLoadData();
  }

  protected tryLoadData() {
    if (this.onSignalSourceCallback) {
      const data = {
        pageNumber: this.pageNumber + 1,
        pageSize: this.pageSize,
        filter: this.filter,
        sortInfo: {
          col: this.sortInfo.column.name,
          type: this.sortInfo.sort,
        },
      };
      this.onSignalSourceCallback({
        ...data,
        ...{ urlencoded: encodeURIComponent(JSON.stringify(data)) },
      });
    } else {
      throw new Error("signalSourceId nor set form grid!");
    }
  }
}
