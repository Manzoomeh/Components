import Grid from "./Grid";
import { ColumnType } from "./type-alias";

export default class GridRow {
  private _data: any;
  private readonly owner: Grid;
  public get data(): any {
    return this._data;
  }
  private order: number;
  private _uiElement: HTMLTableRowElement = null;
  public get uiElement(): HTMLTableRowElement {
    if (!this._uiElement) {
      this._uiElement = document.createElement("tr");
      this.owner.columns.forEach((column) => {
        const td = document.createElement("td");
        let value = null;
        switch (column.type) {
          case ColumnType.Data: {
            value = Reflect.get(this._data, column.name);
            break;
          }
          case ColumnType.Sort: {
            td.setAttribute("data-bc-grid-cell-order", "");
            value = this.order;
            break;
          }
          default:
            break;
        }
        td.appendChild(document.createTextNode(value));
        this._uiElement.appendChild(td);
      });
    } else if (this.order != 0) {
      this._uiElement.querySelector("[data-bc-grid-cell-order]").textContent =
        this.order.toString();
      this.order = 0;
    }
    return this._uiElement;
  }
  constructor(owner: Grid, data: any, order: number) {
    this._data = data;
    this.owner = owner;
    this.order = order + 1;
  }

  public setOrder(order: number): void {
    this.order = order + 1;
  }
}
