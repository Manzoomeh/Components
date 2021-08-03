import { IOptions } from "./options/IOptions";
import { Source } from "./type-alias";

export default class Grid {
  readonly table: HTMLTableElement;
  readonly options: IOptions;
  readonly head: HTMLTableSectionElement;

  static _defaults: Partial<IOptions>;
  static getDefaults(): Partial<IOptions> {
    if (!Grid._defaults) {
      Grid._defaults = {};
    }
    return Grid._defaults;
  }

  constructor(table: HTMLTableElement, options: IOptions, source: Source) {
    if (!table) {
      throw "table element in null or undefined";
    }
    this.table = table;
    this.options = { ...Grid.getDefaults(), ...options };
    this.CreateTable(source);
  }

  private CreateTable(source: Source): void {
    const head = document.createElement("thead");
    const tr = document.createElement("tr");
    const cols = new Array<string>();
    head.appendChild(tr);
    if (this.options.columns) {
      Object.getOwnPropertyNames(this.options.columns).forEach((property) => {
        cols.push(property);
        var value = this.options.columns[property];
        const td = document.createElement("td");
        if (typeof value === "string") {
          td.appendChild(document.createTextNode(value));
        } else td.appendChild(document.createTextNode(value.title));
        tr.appendChild(td);
      });
    } else {
      if (source && source.length > 0 && source[0]) {
        Object.getOwnPropertyNames(source[0]).forEach((property) => {
          cols.push(property);
          const td = document.createElement("td");
          td.appendChild(document.createTextNode(property));
          tr.appendChild(td);
        });
      }
    }
    this.table.appendChild(head);
    const body = document.createElement("tbody");

    source?.forEach((row) => {
      const tr = document.createElement("tr");
      body.appendChild(tr);
      cols.forEach((colName) => {
        const td = document.createElement("td");
        const value = Reflect.get(row, colName);
        td.appendChild(document.createTextNode(value));
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    this.table.appendChild(body);
  }

  private refresh(source: Source): void {}
}
