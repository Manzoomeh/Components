import { GridColumnInfo, IOptions } from "./options/IOptions";
import { Source } from "./type-alias";
//import alasql from "alasql";

export default class Grid {
  readonly table: HTMLTableElement;
  readonly options: IOptions;
  readonly head: HTMLTableSectionElement;
  readonly body: HTMLTableSectionElement;
  private sortColumn: GridColumnInfo;

  static _defaults: Partial<IOptions>;
  private rows: GridRow[] = new Array<GridRow>();
  private source: Source;
  static getDefaults(): Partial<IOptions> {
    if (!Grid._defaults) {
      Grid._defaults = {};
    }
    return Grid._defaults;
  }

  public readonly columns: GridColumnInfo[] = new Array<GridColumnInfo>();

  constructor(table: HTMLTableElement, options: IOptions, source: Source) {
    if (!table) {
      throw "table element in null or undefined";
    }
    this.table = table;
    this.options = { ...Grid.getDefaults(), ...options };
    this.head = document.createElement("thead");
    this.table.appendChild(this.head);
    this.body = document.createElement("tbody");
    this.table.appendChild(this.body);
    this.CreateTable(source);
  }

  private CreateTable(source: Source): void {
    this.source = source;
    const tr = document.createElement("tr");
    this.head.appendChild(tr);
    if (this.options.columns) {
      Object.getOwnPropertyNames(this.options.columns).forEach((property) => {
        var value = this.options.columns[property];
        const td = document.createElement("td");
        let columnInfo: GridColumnInfo;
        if (typeof value === "string") {
          td.appendChild(document.createTextNode(value));
          columnInfo = { title: value, name: property };
        } else {
          td.appendChild(document.createTextNode(value.title));
          columnInfo = { ...value, ...{ name: property } };
        }
        if (columnInfo.sortable ?? true) {
          td.addEventListener("click", (_) => {
            this.sortColumn = columnInfo;
            this.refreshData();
          });
        }
        this.columns.push(columnInfo);
        tr.appendChild(td);
      });
    } else {
      if (source && source.length > 0 && source[0]) {
        Object.getOwnPropertyNames(source[0]).forEach((property) => {
          const td = document.createElement("td");
          td.appendChild(document.createTextNode(property));
          tr.appendChild(td);
          this.columns.push({ name: property });
        });
      }
    }
    this.rows = [];
    this.source?.forEach((row) => {
      const rowObj = new GridRow(this, row);
      this.rows.push(rowObj);
    });
    this.refreshData();
  }

  private refreshData(): void {
    this.body.innerHTML = "";
    let rows = this.rows;
    if (this.sortColumn) {
      rows = rows.sort(this.sortDesc.bind(this));
    }
    rows?.forEach((row) => this.body.appendChild(row.uiElement));
  }
  private sortAsc(first: GridRow, second: GridRow): number {
    const f = Reflect.get(first.data, this.sortColumn.name);
    const s = Reflect.get(second.data, this.sortColumn.name);
    console.log(f, s, first, second, this.sortColumn.name);
    return f < s ? -1 : f > s ? 1 : 0;
  }
  private sortDesc(first: GridRow, second: GridRow): number {
    const f = Reflect.get(first.data, this.sortColumn.name);
    const s = Reflect.get(second.data, this.sortColumn.name);
    return f > s ? -1 : f < s ? 1 : 0;
  }
}

export class GridRow {
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

// static class Uti{
//   static f<T>(first:T, second:T):number => {
//       const f = Reflect.get(first, this.sortColumn.name);
//       const s = Reflect.get(second, this.sortColumn.name);
//       return f < s ? -1 : f > s ? 1 : 0;
//     }
//   }
// }
