import IComponentManager from "../basiscore/IComponentManager";
import ISource from "../basiscore/ISource";
import IUserDefineComponent from "../basiscore/IUserDefineComponent";
import { SourceId } from "../basiscore/type-alias";
import Grid from "./grid/Grid";

export default class BcComponent implements IComponentManager {
  readonly owner: IUserDefineComponent;
  private grid: Grid;
  private container: HTMLTableElement;
  private sourceId: SourceId = null;

  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
    this.container;
  }

  public async initializeAsync(): Promise<void> {
    const sourceId = await this.owner.getAttributeValueAsync("DataMemberName");
    if (sourceId) {
      this.sourceId = sourceId.toLowerCase();
      this.owner.addTrigger([this.sourceId]);
    }
    const style = await this.owner.getAttributeValueAsync("style");
    this.container = document.createElement("table");
    if (style) {
      this.container.setAttribute("style", style);
    }
    this.owner.setContent(this.container);

    const optionName = await this.owner.getAttributeValueAsync(
      "options-object"
    );
    const option = optionName ? eval(optionName) : null;
    this.grid = new Grid(this.container, option);
  }

  public runAsync(source?: ISource): boolean {
    if (this.sourceId) {
      if (source?.id !== this.sourceId) {
        source = this.owner.tryToGetSource(this.sourceId);
      }
      if (source?.id === this.sourceId) {
        this.grid.setSource(source.rows);
      }
    }
    return true;
  }
}
