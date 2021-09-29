import { ColumnType } from "../../enum";
import Grid from "./Grid";

export default class GridRow {
  public readonly data: any;
  private readonly owner: Grid;
  private order: number;
  private _uiElement: HTMLTableRowElement = null;
  public get uiElement(): HTMLTableRowElement {
    if (!this._uiElement) {
      this._uiElement = document.createElement("tr");
      this.owner.columns.forEach((column) => {
        const td = document.createElement("td");
        switch (column.type) {
          case ColumnType.Data: {
            td.setAttribute("data-bc-data", "");
            const tmpValue = Reflect.get(this.data, column.field);
            if (column.cellMaker) {
              td.innerHTML =
                column.cellMaker(this.data, tmpValue, td) ?? tmpValue;
            } else {
              td.appendChild(
                document.createTextNode(tmpValue?.toString() ?? "")
              );
            }
            break;
          }
          case ColumnType.Sort: {
            td.setAttribute("data-bc-order", "");
            td.appendChild(document.createTextNode(this.order.toString()));
            break;
          }
          case ColumnType.Action: {
            td.setAttribute("data-bc-action", "");
            td.setAttribute("data-bc-no-selection", "");
            if (column.actions) {
              const value = new DocumentFragment();
              const div = document.createElement("div");
              div.setAttribute("data-bc-icons", "");
              value.appendChild(div);
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
                    anchorElement.href = actionInfo.url(this.data);
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
              td.appendChild(value);
            }
            break;
          }
          default:
            break;
        }
        this._uiElement.appendChild(td);
      });
      if (this.owner.options.rowMaker) {
        this.owner.options.rowMaker(this.data, this._uiElement);
      }
    } else if (this.order != 0) {
      const cel = this._uiElement.querySelector("[data-bc-order]");
      if (cel) {
        cel.textContent = this.order.toString();
        this.order = 0;
      }
    }
    return this._uiElement;
  }

  constructor(owner: Grid, data: any, order: number) {
    this.data = data;
    this.owner = owner;
    this.order = order + 1;
  }

  public setOrder(order: number): void {
    this.order = order + 1;
  }
}
