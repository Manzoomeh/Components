import { IOptions } from "./options/IOptions";
import { GridColumnInfo, SortInfo, SortType, Source } from "./type-alias";
import "./asset/style.css";
import GridRow from "./GridRow";
//import alasql from "alasql";

export default class Grid {
  readonly table: HTMLTableElement;
  readonly options: IOptions;
  readonly head: HTMLTableSectionElement;
  readonly body: HTMLTableSectionElement;
  private sortInfo: SortInfo;
  private filter: string;

  static _defaults: Partial<IOptions>;
  private rows: GridRow[] = new Array<GridRow>();
  private source: Source;
  static getDefaults(): Partial<IOptions> {
    if (!Grid._defaults) {
      Grid._defaults = {
        filter: true,
        pageSize: [10, 30, 50],
        paging: true,
      };
    }
    return Grid._defaults;
  }

  public readonly columns: GridColumnInfo[] = new Array<GridColumnInfo>();

  constructor(table: HTMLTableElement, options: IOptions, source: Source) {
    if (!table) {
      throw "table element in null or undefined";
    }

    this.options = { ...Grid.getDefaults(), ...options };
    this.init(table);
    this.table = table;
    this.table.setAttribute("data-bc-grid", "");
    this.head = document.createElement("thead");
    this.table.appendChild(this.head);
    this.body = document.createElement("tbody");
    this.table.appendChild(this.body);
    this.CreateTable(source);
  }

  private init(table: HTMLTableElement) {
    const container = document.createElement("div");
    container.setAttribute("data-bc-grid-container", "");

    table.parentNode.insertBefore(container, table);
    table.parentNode.removeChild(table);
    if (this.options.filter) {
      const filter = document.createElement("div");
      filter.setAttribute("data-bc-grid-filter-container", "");
      container.appendChild(filter);
      const label = document.createElement("label");
      label.appendChild(document.createTextNode("Search:"));
      const input = document.createElement("input");
      label.appendChild(input);
      input.addEventListener("keyup", (_) => {
        this.filter = input.value?.toLowerCase();
        console.log(input.value);
        this.refreshData();
      });
      filter.appendChild(label);
    }

    if (this.options.paging) {
      if (this.options.pageSize?.length > 1) {
        const pageSize = document.createElement("div");
        pageSize.setAttribute("data-bc-grid-pagesize-container", "");
        container.appendChild(pageSize);
      }
      container.appendChild(table);
      const paging = document.createElement("div");
      paging.setAttribute("data-bc-grid-paging-container", "");
      container.appendChild(paging);
    }
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
          td.setAttribute("data-bc-sorting", "");
          td.addEventListener("click", (_) => {
            if (this.sortInfo?.columnName !== columnInfo.name) {
              this.head
                .querySelectorAll("[data-bc-sorting]")
                .forEach((element) =>
                  element.setAttribute("data-bc-sorting", "")
                );
            }

            let sortType = td.getAttribute("data-bc-sorting") as SortType;
            if (sortType) {
              sortType = sortType === "asc" ? "desc" : "asc";
            } else {
              sortType = "asc";
            }

            this.sortInfo = {
              columnName: columnInfo.name,
              sortType: sortType,
            };
            td.setAttribute("data-bc-sorting", sortType);
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
    if (this.filter?.length > 0) {
      rows = rows.filter(this.applyFilter.bind(this));
    }
    if (this.sortInfo) {
      rows = rows.sort(
        (this.sortInfo.sortType === "asc" ? this.sortAsc : this.sortDesc).bind(
          this
        )
      );
    }
    rows?.forEach((row) => this.body.appendChild(row.uiElement));
  }

  private applyFilter(row: GridRow) {
    const colInfo = this.columns.find((col) => {
      const value = Reflect.get(row.data, col.name)?.toString().toLowerCase();
      console.log(value, this.filter, value.indexOf(this.filter) >= 0);
      return value.indexOf(this.filter) >= 0;
    });
    console.log(row.data, colInfo);
    return colInfo;
  }

  private sortAsc(first: GridRow, second: GridRow): number {
    let valFirst = Reflect.get(first.data, this.sortInfo.columnName);
    let valSecond = Reflect.get(second.data, this.sortInfo.columnName);
    if (typeof valFirst === "string") {
      valFirst = valFirst.toLowerCase();
    }
    if (typeof valSecond === "string") {
      valSecond = valSecond.toLowerCase();
    }
    return valFirst < valSecond ? -1 : valFirst > valSecond ? 1 : 0;
  }

  private sortDesc(first: GridRow, second: GridRow): number {
    let valFirst = Reflect.get(first.data, this.sortInfo.columnName);
    let valSecond = Reflect.get(second.data, this.sortInfo.columnName);
    if (typeof valFirst === "string") {
      valFirst = valFirst.toLowerCase();
    }
    if (typeof valSecond === "string") {
      valSecond = valSecond.toLowerCase();
    }
    return valFirst > valSecond ? -1 : valFirst < valSecond ? 1 : 0;
  }
}
