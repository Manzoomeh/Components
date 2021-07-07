import { MergeType } from "../../basiscore/enum";
import IComponentManager from "../../basiscore/IComponentManager";
import ISource from "../../basiscore/ISource";
import IUserDefineComponent from "../../basiscore/IUserDefineComponent";
import { SourceId } from "../../basiscore/type-alias";
import IOption from "../Watermark/IOptions";
import Watermark from "../Watermark/Watermark";

export default class UserComponent implements IComponentManager {
  readonly owner: IUserDefineComponent;
  private watermark: Watermark;
  private svgBgImageSourceId: SourceId;
  private watermarkItemsSourceId: SourceId;

  constructor(owner: IUserDefineComponent) {
    this.owner = owner;
  }

  public async initializeAsync(): Promise<void> {
    console.log("UserComponent:initializeAsync");

    this.svgBgImageSourceId = await this.owner.getAttributeValueAsync(
      "wm-background"
    );

    this.watermarkItemsSourceId = await this.owner.getAttributeValueAsync(
      "wm-items"
    );
    const resultSourceId = await this.owner.getAttributeValueAsync(
      "wm-resultId"
    );
    const btnId = await this.owner.getAttributeValueAsync("wm-btn");
    document.querySelector(btnId)?.addEventListener("click", (e) => {
      e.preventDefault();
      if (this.watermark) {
        const img = this.watermark.getResult();
        this.owner.setSource(resultSourceId, img, MergeType.replace);
      }
    });
    this.owner.addTrigger([
      this.svgBgImageSourceId,
      this.watermarkItemsSourceId,
    ]);
  }

  public async runAsync(source?: ISource): Promise<boolean> {
    if (source?.id === this.svgBgImageSourceId) {
      const svg = await this.owner.getAttributeValueAsync("wm-element");
      const svgElement = document.querySelector<SVGElement>(svg);
      const option: IOption = {
        SvgElement: svgElement,
        ImageInfo: source.rows[0],
      };
      this.watermark = new Watermark(option);
    }
    if (this.watermark) {
      if (source?.id === this.watermarkItemsSourceId) {
        if (source.rows.length !== this.watermark.Elements.length) {
          const keys = source.rows.map((x) => x.Key);
          const removedElements = this.watermark.Elements.filter((x) => {
            const info = x.getElementInfo();
            return info.Key && keys.indexOf(info.Key) == -1;
          });
          removedElements.forEach((x) => x.remove());
        }
        for (const row of source.rows) {
          const element = this.watermark.Elements.find(
            (x) => x.getElementInfo().Key === row.Key
          );
          if (element) {
            element.setElementInfo(row);
          } else {
            row.Type === "TEXT"
              ? this.watermark.addTextElement(row)
              : this.watermark.addImageElement(row);
          }
        }
      }
    }
    return true;
  }
}
