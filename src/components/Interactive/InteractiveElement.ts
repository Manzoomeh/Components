import Watermark from "../Watermark/Watermark";
import "./InteractiveElement.css";
import ElementInfo from "../../ElementInfo";
import ContainerElement from "./ContainerElement";
import TileElement from "../Tile/TileElement";

export default abstract class InteractiveElement<
  TSVGElement extends SVGGraphicsElement,
  TElementInfo extends ElementInfo
> extends ContainerElement<TSVGElement> {
  private _tileElement: TileElement<TSVGElement>;
  constructor(owner: Watermark, readonly ElementInfo: TElementInfo) {
    super(owner);
    this._tileElement = new TileElement<TSVGElement>(owner, this);
    this.initElement();
  }
  protected abstract setInfo(info: TElementInfo);
  setElementInfo(info: ElementInfo) {
    this.ElementInfo.Rotate = info.Rotate || 0;
    this.ElementInfo.Opacity = info.Opacity || 1;
    this.ElementInfo.TileMode = info.TileMode || "NONE";
    this.ElementInfo.Span = info.Span || 0;
    this.setInfo(info as TElementInfo);
  }
  getElementInfo(): ElementInfo {
    return this.ElementInfo;
  }

  protected updateUI() {
    let value = "";
    if (this.Position.X != 0 || this.Position.Y != 0) {
      value += `translate(${this.Position.X} ${this.Position.Y}) `;
    }
    if (this.ElementInfo.Rotate != 0) {
      value += `rotate(${this.ElementInfo.Rotate}) `;
    }

    if (value !== "") {
      this.getSVGElement().setAttribute("transform", value);
    } else {
      this.getSVGElement().removeAttribute("transform");
    }

    if (this.ElementInfo.Opacity != 1) {
      this.Content.setAttribute("opacity", this.ElementInfo.Opacity.toString());
    } else {
      this.Content.removeAttribute("opacity");
    }
    this.updateBorder();
    this._tileElement.updateTiles(
      this.ElementInfo.TileMode,
      this.ElementInfo.Span
    );
  }
}
