import { GridColumnInfo, IOptions } from "./options/IOptions";
import { SortInfo, SortType, Source } from "./type-alias";
import "./asset/style.css";
import GridRow from "./GridRow";
import IGrid from "./IGrid";
import GridPaginate from "./GridPaginate";

export default class Grid implements IGrid {
  readonly table: HTMLTableElement;
  readonly options: IOptions;
  readonly head: HTMLTableSectionElement;
  readonly body: HTMLTableSectionElement;
  private sortInfo: SortInfo;
  private filter: string;

  static _defaults: Partial<IOptions>;
  private rows: GridRow[] = new Array<GridRow>();
  private source: Source;
  pageSize: number;
  pageNumber: number = 1;
  private paginate: GridPaginate;
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

  constructor(table: HTMLTableElement, options: IOptions) {
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
    this.CreateTable();
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
        this.refreshData();
      });
      filter.appendChild(label);
    }
    if (this.options.paging) {
      const pageSizeContainer = document.createElement("div");
      pageSizeContainer.setAttribute("data-bc-grid-pagesize-container", "");
      container.appendChild(pageSizeContainer);

      container.appendChild(table);
      const pagingContainer = document.createElement("div");
      pagingContainer.setAttribute("data-bc-grid-paging-container", "");
      container.appendChild(pagingContainer);

      this.paginate = new GridPaginate(
        this,
        pageSizeContainer,
        pagingContainer
      );
    }
  }

  private CreateTable(): void {
    //this.source = source;
    const tr = document.createElement("tr");
    tr.setAttribute("data-bc-grid-header", "");
    this.head.appendChild(tr);
    const addSorting = (
      td: HTMLTableDataCellElement,
      columnInfo: GridColumnInfo
    ) => {
      td.setAttribute("data-bc-sorting", "");
      td.addEventListener("click", (_) => {
        if (this.sortInfo?.column !== columnInfo) {
          this.head
            .querySelectorAll("[data-bc-sorting]")
            .forEach((element) => element.setAttribute("data-bc-sorting", ""));
        }
        let sortType = td.getAttribute("data-bc-sorting") as SortType;
        if (sortType) {
          sortType = sortType === "asc" ? "desc" : "asc";
        } else {
          sortType = "asc";
        }
        this.sortInfo = {
          column: columnInfo,
          sort: sortType,
        };
        td.setAttribute("data-bc-sorting", sortType);
        this.refreshData();
      });
      if (this.options.defaultSort) {
        let sortType: SortType = null;
        let find = false;
        if (typeof this.options.defaultSort === "string") {
          if (this.options.defaultSort === columnInfo.name) {
            find = true;
          }
        } else if (this.options.defaultSort.name === columnInfo.name) {
          find = true;
          sortType = this.options.defaultSort.sort;
        }
        if (find) {
          this.sortInfo = {
            column: columnInfo,
            sort: sortType ?? "asc",
          };
          td.setAttribute("data-bc-sorting", this.sortInfo.sort);
        }
      }
    };
    if (this.options.rowNumber) {
      const td = document.createElement("td");
      let columnInfo: GridColumnInfo;
      if (typeof this.options.rowNumber === "boolean") {
        td.appendChild(document.createTextNode("#"));
        columnInfo = { title: null, name: "orderId" };
      } else {
        const title = this.options.rowNumber.title ?? "#";
        td.appendChild(document.createTextNode(title));
        columnInfo = { ...{ name: "orderId" }, ...this.options.rowNumber };
        columnInfo.title = this.options.rowNumber.name ? title : null;
      }
      if (columnInfo.sort ?? true) {
        addSorting(td, columnInfo);
      }
      this.columns.push(columnInfo);
      tr.appendChild(td);
    }
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
        if (columnInfo.sort ?? true) {
          addSorting(td, columnInfo);
        }
        this.columns.push(columnInfo);
        tr.appendChild(td);
      });
    }
  }

  public setSource(source: Source) {
    if (!this.options.columns) {
      const tr = this.head.querySelector("tr[data-bc-grid-header]");
      if (source && source.length > 0 && source[0]) {
        Object.getOwnPropertyNames(source[0]).forEach((property) => {
          const td = document.createElement("td");
          td.appendChild(document.createTextNode(property));
          tr.appendChild(td);
          this.columns.push({ name: property });
        });
      }
    }

    //TODO:add repository for store generated ui element data
    this.rows = [];
    this.source = source;
    this.source?.forEach((row, index) => {
      const rowObj = new GridRow(this, row, index);
      this.rows.push(rowObj);
    });

    this.refreshData();
  }

  private refreshData(): void {
    let rows = this.rows;
    if (this.filter?.length > 0) {
      rows = rows.filter(this.applyFilter.bind(this));
    }
    if (this.sortInfo) {
      rows = rows.sort(
        (this.sortInfo.sort === "asc" ? this.sortAsc : this.sortDesc).bind(this)
      );
    }
    this.paginate.setSource(rows);
    this.displayCurrentRows();
  }

  public displayCurrentRows() {
    this.body.innerHTML = "";
    const toDrawRow = this.paginate?.getCurrentPageRows() ?? this.source;
    toDrawRow?.forEach((row) => this.body.appendChild(row.uiElement));
  }

  private applyFilter(row: GridRow) {
    const colInfo = this.columns.find((col) => {
      const value = Reflect.get(row.data, col.name)?.toString().toLowerCase();
      console.log(value, this.filter, value.indexOf(this.filter) >= 0);
      return value.indexOf(this.filter) >= 0;
    });
    //console.log(row.data, colInfo);
    return colInfo;
  }

  private sortAsc(first: GridRow, second: GridRow): number {
    let valFirst = Reflect.get(
      this.sortInfo.column.title ? first.data : first,
      this.sortInfo.column.name
    );
    let valSecond = Reflect.get(
      this.sortInfo.column.title ? second.data : second,
      this.sortInfo.column.name
    );
    if (typeof valFirst === "string") {
      valFirst = valFirst.toLowerCase();
    }
    if (typeof valSecond === "string") {
      valSecond = valSecond.toLowerCase();
    }
    return valFirst < valSecond ? -1 : valFirst > valSecond ? 1 : 0;
  }

  private sortDesc(first: GridRow, second: GridRow): number {
    let valFirst = Reflect.get(
      this.sortInfo.column.title ? first.data : first,
      this.sortInfo.column.name
    );
    let valSecond = Reflect.get(
      this.sortInfo.column.title ? second.data : second,
      this.sortInfo.column.name
    );
    if (typeof valFirst === "string") {
      valFirst = valFirst.toLowerCase();
    }
    if (typeof valSecond === "string") {
      valSecond = valSecond.toLowerCase();
    }
    return valFirst > valSecond ? -1 : valFirst < valSecond ? 1 : 0;
  }
}
