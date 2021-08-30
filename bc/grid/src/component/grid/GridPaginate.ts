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

  setSource(data: Array<GridRow>) {
    this.data = data;
    this.totalRows = data.length;
    this.pageNumber = 0;
    this.totalPage =
      Math.floor(this.totalRows / this.pageSize) +
      (Math.ceil(this.totalRows % this.pageSize) > 0 ? 1 : 0);
    this.updatePaging();
    this.owner.displayCurrentRows();
  }

  updatePaging() {
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
        page.setAttribute("data-bc-grid-page-start", "");
      }
      if (i === endPage - 1) {
        page.setAttribute("data-bc-grid-page-end", "");
      }
      page.appendChild(document.createTextNode((i + 1).toString()));
      page.setAttribute("data-bc-grid-page", i.toString());
      page.addEventListener("click", (e) => {
        this.pageNumber = i;
        this.owner.displayCurrentRows();
      });
      this.pageButtonsContainer.append(page);
    }
  }

  getCurrentPageRows(): IGridSource {
    const from = this.pageNumber * this.pageSize;
    const to = from + this.pageSize;
    this.updateState();
    return this.data.filter((_, i) => i >= from && i < to);
  }

  initializeUI(): void {
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
        this.owner.displayCurrentRows();
      }
    });
    this.pageButtonsContainer = document.createElement("span");

    this.nextButton = document.createElement("a");
    this.nextButton.appendChild(document.createTextNode("next"));
    this.nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.pageNumber + 1 < this.totalPage) {
        this.pageNumber += 1;
        this.owner.displayCurrentRows();
      }
    });
    this.pagingContainer.appendChild(this.previousButton);
    this.pagingContainer.appendChild(this.pageButtonsContainer);
    this.pagingContainer.appendChild(this.nextButton);
  }
  private updateState() {
    this.nextButton.setAttribute(
      "data-bc-grid-btn-status",
      this.pageNumber + 1 >= this.totalPage ? "disabled" : ""
    );
    this.previousButton.setAttribute(
      "data-bc-grid-btn-status",
      this.pageNumber === 0 ? "disabled" : ""
    );
    const pageBtn = this.pageButtonsContainer.querySelector(
      `[data-bc-grid-page='${this.pageNumber}']`
    );
    if (
      pageBtn &&
      ((pageBtn.hasAttribute("data-bc-grid-page-end") && this.remainFromEnd) ||
        (pageBtn.hasAttribute("data-bc-grid-page-start") &&
          this.remainFromStart))
    ) {
      this.updatePaging();
    }
    this.pageButtonsContainer
      .querySelectorAll("[data-bc-grid-page]")
      .forEach((x) => {
        const pageId = parseInt(x.getAttribute("data-bc-grid-page"));
        x.setAttribute(
          "data-bc-grid-current-page",
          this.pageNumber === pageId ? "active" : ""
        );
      });
  }
}
