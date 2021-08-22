import Grid from "./Grid";

export default class GridRow {
  private _data: any;
  private readonly owner: Grid;
  public get data(): any {
    return this._data;
  }
  private _uiElement: HTMLTableRowElement = null;
  public get uiElement(): HTMLTableRowElement {
    if (!this._uiElement) {
      this._uiElement = document.createElement("tr");
      this.owner.columns.forEach((column) => {
        const td = document.createElement("td");
        const value = Reflect.get(this._data, column.name);
        td.appendChild(document.createTextNode(value));
        this._uiElement.appendChild(td);
      });
    }
    return this._uiElement;
  }
  constructor(owner: Grid, data: any) {
    this._data = data;
    this.owner = owner;
  }
}
