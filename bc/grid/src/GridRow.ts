import Grid from "./Grid";

export default class GridRow {
  private _data: any;
  private readonly owner: Grid;
  public get data(): any {
    return this._data;
  }
  readonly orderId: number;
  private _uiElement: HTMLTableRowElement = null;
  public get uiElement(): HTMLTableRowElement {
    if (!this._uiElement) {
      this._uiElement = document.createElement("tr");
      this.owner.columns.forEach((column) => {
        const td = document.createElement("td");
        const value = Reflect.get(
          column.title ? this._data : this,
          column.name
        );
        td.appendChild(document.createTextNode(value));
        this._uiElement.appendChild(td);
      });
    }
    return this._uiElement;
  }
  constructor(owner: Grid, data: any, orderId: number) {
    this._data = data;
    this.owner = owner;
    this.orderId = orderId;
  }
}
