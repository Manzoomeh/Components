import { IGridOptions } from "./IOptions";
import {
  IGridColumnInfo,
  ISortInfo,
  ISortType,
  IGridSource,
} from "../../type-alias";
import "./../../asset/style.css";
import GridRow from "./GridRow";
import IGrid from "./IGrid";
import GridPaginate from "./GridPaginate";
import { ColumnType } from "../../enum";

export default class Grid implements IGrid {
  readonly container: HTMLElement;
  readonly table: HTMLTableElement;
  readonly options: IGridOptions;
  readonly head: HTMLTableSectionElement;
  readonly body: HTMLTableSectionElement;
  private sortInfo: ISortInfo;
  private filter: string;

  static _defaults: Partial<IGridOptions>;
  private rows: GridRow[] = new Array<GridRow>();
  private source: IGridSource;
  private columnsInitialized = false;
  pageSize: number;
  pageNumber: number = 1;
  private paginate: GridPaginate;
  public readonly columns: IGridColumnInfo[] = new Array<IGridColumnInfo>();
  static getDefaults(): Partial<IGridOptions> {
    if (!Grid._defaults) {
      Grid._defaults = {
        filter: "simple",
        pageSize: [10, 30, 50],
        paging: true,
        pageCount: 10,
        sorting: true,
      };
    }
    return Grid._defaults;
  }

  constructor(container: HTMLElement, options?: IGridOptions) {
    if (!container) {
      throw "table element in null or undefined";
    }

    this.options = {
      ...Grid.getDefaults(),
      ...(options ? options : ({} as any)),
    };

    this.container = container;
    this.container.setAttribute("data-bc-grid", "");
    this.table = document.createElement("table");
    this.table.setAttribute("data-bc-table", "");
    this.head = document.createElement("thead");
    this.table.appendChild(this.head);
    this.body = document.createElement("tbody");
    this.table.appendChild(this.body);

    this.createUI();
  }

  private createUI(): void {
    if (this.options.filter == "simple") {
      const filter = document.createElement("div");
      filter.setAttribute("data-bc-filter-container", "");
      this.container.appendChild(filter);
      const label = document.createElement("label");
      label.appendChild(document.createTextNode("Search :"));
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      label.appendChild(input);
      input.addEventListener("keyup", (_) => {
        this.filter = input.value?.toLowerCase();
        this.refreshData();
      });
      filter.appendChild(label);
    }
    this.container.appendChild(this.table);
    if (this.options.paging) {
      const pageSizeContainer = document.createElement("div");
      pageSizeContainer.setAttribute("data-bc-pagesize-container", "");
      this.container.insertBefore(pageSizeContainer, this.table);
      const pagingContainer = document.createElement("div");
      pagingContainer.setAttribute("data-bc-paging-container", "");
      pagingContainer.setAttribute("data-bc-no-selection", "");
      this.container.appendChild(pagingContainer);
      this.paginate = new GridPaginate(
        this,
        pageSizeContainer,
        pagingContainer
      );
    }
    this.createTable();
  }

  private createTable(): void {
    const colgroup = document.createElement("colgroup");
    this.table.prepend(colgroup);
    const tr = document.createElement("tr");
    tr.setAttribute("data-bc-no-selection", "");
    this.head.appendChild(tr);
    if (this.options.rowNumber) {
      const col = document.createElement("col");
      col.setAttribute("width", "5%");
      colgroup.appendChild(col);

      const columnInfo: IGridColumnInfo = {
        title: this.options.rowNumber,
        name: null,
        type: ColumnType.Sort,
      };
      tr.appendChild(this.createColumn(columnInfo));
    }
    if (this.options.columns) {
      Object.getOwnPropertyNames(this.options.columns).forEach((property) => {
        var value = this.options.columns[property];
        const col = document.createElement("col");
        let columnInfo: IGridColumnInfo;
        if (typeof value === "string") {
          columnInfo = {
            title: value,
            name: property,
            sort: this.options.sorting,
            type: ColumnType.Data,
            filter: true,
          };
        } else {
          columnInfo = {
            ...{
              name: property,
              sort: this.options.sorting,
              type: value.actions ? ColumnType.Action : ColumnType.Data,
              filter: true,
            },
            ...value,
          };
          if (value.width) {
            col.setAttribute("width", value.width);
          }
        }
        colgroup.appendChild(col);
        tr.appendChild(this.createColumn(columnInfo));
      });
      this.columnsInitialized = true;
    }
  }

  private createColumn(columnInfo: IGridColumnInfo): HTMLTableDataCellElement {
    const td = document.createElement("td");
    td.appendChild(document.createTextNode(columnInfo.title));
    if (columnInfo.type === ColumnType.Data && (columnInfo.sort ?? true)) {
      td.setAttribute("data-bc-sorting", "");
      td.addEventListener("click", (_) => {
        if (this.sortInfo?.column !== columnInfo) {
          this.head
            .querySelectorAll("[data-bc-sorting]")
            .forEach((element) => element.setAttribute("data-bc-sorting", ""));
        }
        let sortType = td.getAttribute("data-bc-sorting") as ISortType;
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
        let sortType: ISortType = null;
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
    }
    this.columns.push(columnInfo);
    return td;
  }

  public setSource(source: IGridSource): void {
    if (!this.columnsInitialized) {
      const tr = this.head.querySelector("tr");
      if (source && source.length > 0 && source[0]) {
        Object.getOwnPropertyNames(source[0]).forEach((property) => {
          const columnInfo: IGridColumnInfo = {
            title: property,
            name: property,
            sort: this.options.sorting,
            type: ColumnType.Data,
            filter: true,
          };
          tr.appendChild(this.createColumn(columnInfo));
        });
      }
      this.columnsInitialized = true;
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
    rows.forEach((row, i) => row.setOrder(i));
    if (this.paginate) {
      this.paginate.setSource(rows);
    } else {
      this.displayRows(rows);
    }
  }

  public displayRows(rows: GridRow[]): void {
    this.body.innerHTML = "";
    rows?.forEach((row) => this.body.appendChild(row.uiElement));
  }

  private applyFilter(row: GridRow): IGridColumnInfo {
    const colInfo = this.columns.find((col) => {
      let retVal = false;
      if (col.type === ColumnType.Data && col.filter) {
        const value = Reflect.get(row.data, col.name)?.toString().toLowerCase();
        retVal = value.indexOf(this.filter) >= 0;
      }
      return retVal;
    });
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
