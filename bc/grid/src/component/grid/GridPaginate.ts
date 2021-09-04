import GridRow from "./GridRow";
import IGrid from "./IGrid";
import { IGridSource } from "./../../type-alias";

export default class GridPaginate {
  readonly owner: IGrid;
  readonly pagingContainer: HTMLDivElement;
  readonly pageSizeContainer: HTMLDivElement;

  private previousButton: HTMLAnchorElement;
  private nextButton: HTMLAnchorElement;
  private pageButtonsContainer: HTMLSpanElement;
  private remainFromStart: boolean;
  private remainFromEnd: boolean;

  private data: IGridSource;

  public pageSize: number;
  public pageNumber: number;
  public totalPage: number;
  public totalRows: number;

  constructor(
    owner: IGrid,
    pageSizeContainer: HTMLDivElement,
    pagingContainer: HTMLDivElement
  ) {
    this.owner = owner;
    this.pageSizeContainer = pageSizeContainer;
    this.pagingContainer = pagingContainer;
    this.initializeUI();
    this.pageSize = this.owner.options.pageSize
      ? this.owner.options.pageSize[0]
      : -1;
  }

  setSource(data: Array<GridRow>): void {
    this.data = data;
    this.totalRows = data.length;
    this.pageNumber = 0;
    this.totalPage =
      Math.floor(this.totalRows / this.pageSize) +
      (Math.ceil(this.totalRows % this.pageSize) > 0 ? 1 : 0);
    this.updatePaging();
    this.displayCurrentRows();
  }

  private displayCurrentRows(): void {
    const from = this.pageNumber * this.pageSize;
    const to = from + this.pageSize;
    this.updateState();
    const rows = this.data.filter((_, i) => i >= from && i < to);
    this.owner.displayRows(rows);
  }

  private updatePaging(): void {
    this.pageButtonsContainer.innerHTML = "";
    const pageSideCount = Math.floor(this.owner.options.pageCount / 2);
    const startPage = Math.max(0, this.pageNumber - pageSideCount);
    const endPage = Math.min(
      this.totalPage,
      startPage + this.owner.options.pageCount
    );
    this.remainFromStart = startPage != 0;
    this.remainFromEnd = endPage != this.totalPage;
    for (let i = startPage; i < endPage; i++) {
      const page = document.createElement("a");
      if (i === startPage) {
        page.setAttribute("data-bc-first", "");
      }
      if (i === endPage - 1) {
        page.setAttribute("data-bc-last", "");
      }
      page.appendChild(document.createTextNode((i + 1).toString()));
      page.setAttribute("data-bc-page", i.toString());
      page.addEventListener("click", (e) => {
        this.pageNumber = i;
        this.displayCurrentRows();
      });
      this.pageButtonsContainer.append(page);
    }
  }

  private initializeUI(): void {
    const label = document.createElement("label");
    label.appendChild(document.createTextNode("Show"));
    const select = document.createElement("select");
    this.owner.options.pageSize.forEach((pageSize) => {
      const option = document.createElement("option");
      const value = pageSize.toString();
      option.appendChild(document.createTextNode(value));
      option.setAttribute("value", value);
      select.appendChild(option);
    });
    select.addEventListener("change", (x) => {
      const newSize = parseInt((x.target as HTMLSelectElement).value);
      if (this.pageSize != newSize) {
        this.pageSize = newSize;
        this.setSource(this.data);
      }
    });
    label.appendChild(select);
    label.appendChild(document.createTextNode("entries"));
    this.pageSizeContainer.appendChild(label);

    this.previousButton = document.createElement("a");
    this.previousButton.appendChild(document.createTextNode("previous"));
    this.previousButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.pageNumber > 0) {
        this.pageNumber -= 1;
        this.displayCurrentRows();
      }
    });
    this.pageButtonsContainer = document.createElement("span");

    this.nextButton = document.createElement("a");
    this.nextButton.appendChild(document.createTextNode("next"));
    this.nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.pageNumber + 1 < this.totalPage) {
        this.pageNumber += 1;
        this.displayCurrentRows();
      }
    });
    this.pagingContainer.appendChild(this.previousButton);
    this.pagingContainer.appendChild(this.pageButtonsContainer);
    this.pagingContainer.appendChild(this.nextButton);
    this.updateState();
  }

  private updateState(): void {
    this.nextButton.setAttribute(
      "data-bc-status",
      this.pageNumber + 1 >= this.totalPage ? "disabled" : ""
    );
    this.previousButton.setAttribute(
      "data-bc-status",
      this.pageNumber === 0 ? "disabled" : ""
    );
    const pageBtn = this.pageButtonsContainer.querySelector(
      `[data-bc-page='${this.pageNumber}']`
    );
    if (
      pageBtn &&
      ((pageBtn.hasAttribute("data-bc-last") && this.remainFromEnd) ||
        (pageBtn.hasAttribute("data-bc-first") && this.remainFromStart))
    ) {
      this.updatePaging();
    }
    this.pageButtonsContainer
      .querySelectorAll("[data-bc-page]")
      .forEach((x) => {
        const pageId = parseInt(x.getAttribute("data-bc-page"));
        x.setAttribute(
          "data-bc-current",
          this.pageNumber === pageId ? "true" : "false"
        );
      });
  }
}