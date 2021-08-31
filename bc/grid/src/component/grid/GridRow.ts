import { ColumnType } from "../../enum";
import Grid from "./Grid";

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
        let value: Node = null;
        switch (column.type) {
          case ColumnType.Data: {
            const tmpValue = Reflect.get(this._data, column.name);
            value = document.createTextNode(tmpValue?.toString());
            break;
          }
          case ColumnType.Sort: {
            td.setAttribute("data-bc-grid-cell-order", "");
            value = document.createTextNode(this.order.toString());
            break;
          }
          case ColumnType.Action: {
            td.setAttribute("data-bc-grid-cell-action", "");
            if (column.actions) {
              value = new DocumentFragment();
              column.actions.forEach((actionInfo) => {
                const anchorElement = document.createElement("a");
                value.appendChild(anchorElement);
                if (actionInfo.imageUrl) {
                  const img = document.createElement("img");
                  anchorElement.appendChild(img);
                  img.src = actionInfo.imageUrl;
                  img.title = actionInfo.label;
                } else if (actionInfo.label) {
                  anchorElement.innerText = actionInfo.label;
                }

                if (actionInfo.url) {
                  if (typeof actionInfo.url === "string") {
                    anchorElement.href = actionInfo.url;
                  } else {
                    anchorElement.href = actionInfo.url(this._data);
                  }
                } else if (actionInfo.action) {
                  anchorElement.href = "javascript:void()";
                  anchorElement.addEventListener("click", (e) => {
                    e.preventDefault();
                    actionInfo.action(
                      this.data,
                      td.parentElement as HTMLTableRowElement
                    );
                  });
                }
              });
            }
            break;
          }
          default:
            break;
        }
        td.appendChild(value);
        this._uiElement.appendChild(td);
      });
    } else if (this.order != 0) {
      const cel = this._uiElement.querySelector("[data-bc-grid-cell-order]");
      if (cel) {
        cel.textContent = this.order.toString();
        this.order = 0;
      }
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
