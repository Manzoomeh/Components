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
  private filter: any = null;

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
        paging: [10, 30, 50],
        pageCount: 10,
        sorting: true,
        pageNumber: 1,
        direction: "rtl",
        culture: {
          labels: {
            search: "Search :",
            pageSize: "Page Size :",
            next: "Next",
            previous: "Previous",
            first: "First",
            last: "last",
          },
        },
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
      ...(options ?? ({} as any)),
    };
    this.options.culture.labels = {
      ...Grid.getDefaults().culture.labels,
      ...(options?.culture?.labels ?? {}),
    };
    this.container = container;
    this.container.setAttribute("data-bc-grid", "");
    if (this.options.direction) {
      this.container.style["direction"] = this.options.direction;
    }
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
      label.appendChild(
        document.createTextNode(this.options.culture.labels.search)
      );
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

  private addTableRowFilterPart() {
    if (this.options.filter === "row") {
      const tr = document.createElement("tr");
      tr.setAttribute("data-bc-no-selection", "");
      tr.setAttribute("data-bc-filter", "");
      this.head.appendChild(tr);
      this.columns.forEach((columnInfo) => {
        if (columnInfo.filter) {
          const td = document.createElement("td");
          const input = document.createElement("input");
          input.setAttribute("type", "text");
          input.setAttribute("placeholder", columnInfo.title);
          input.addEventListener("keyup", (_) => {
            const value = input.value?.toLowerCase();
            if (value.length > 0) {
              if (!this.filter) {
                this.filter = {};
              }
              this.filter[columnInfo.name] = input.value?.toLowerCase();
            } else {
              delete this.filter[columnInfo.name];
            }
            this.refreshData();
          });
          td.appendChild(input);
          tr.appendChild(td);
        } else {
          tr.appendChild(document.createElement("td"));
        }
      });
    }
  }

  private createTable(): void {
    const colgroup = document.createElement("colgroup");
    this.table.prepend(colgroup);
    const tr = document.createElement("tr");
    tr.setAttribute("data-bc-no-selection", "");
    tr.setAttribute("data-bc-column-title", "");
    this.head.appendChild(tr);
    if (this.options.rowNumber) {
      const col = document.createElement("col");
      col.setAttribute("width", "5%");
      colgroup.appendChild(col);

      const columnInfo: IGridColumnInfo = {
        title: this.options.rowNumber,
        source: null,
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
            source: property,
            name: property,
            sort: this.options.sorting,
            type: ColumnType.Data,
            filter: true,
          };
        } else {
          columnInfo = {
            ...{
              title: property,
              source: property,
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
      this.addTableRowFilterPart();
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
          if (this.options.defaultSort === columnInfo.source) {
            find = true;
          }
        } else if (this.options.defaultSort.name === columnInfo.source) {
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
            source: property,
            name: property,
            sort: this.options.sorting,
            type: ColumnType.Data,
            filter: true,
          };
          tr.appendChild(this.createColumn(columnInfo));
        });
      }
      this.columnsInitialized = true;
      this.addTableRowFilterPart();
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
    if (this.options.filter === "simple" && this.filter?.length > 0) {
      rows = rows.filter((x) => x.acceptableBySimpleFilter(this.filter));
    } else if (
      this.options.filter === "row" &&
      this.filter &&
      Reflect.ownKeys(this.filter).length > 0
    ) {
      rows = rows.filter((x) => x.acceptableByRowFilter(this.filter));
    }
    if (this.sortInfo) {
      rows = rows.sort((a, b) => GridRow.compare(a, b, this.sortInfo));
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
}
