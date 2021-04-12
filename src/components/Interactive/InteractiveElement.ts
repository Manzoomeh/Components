import Watermark from "../Watermark/Watermark";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import Position from "../../models/Position";
import "./InteractiveElement.css";
import WatermarkElement from "../../models/WatermarkElement";
import ElementInfo from "../../ElementInfo";

export default abstract class InteractiveElement<
  TSVGElement extends SVGGraphicsElement,
  TElementInfo extends ElementInfo
> extends WatermarkElement {
  private _borderElement: SVGRectElement;
  private _groupElement: SVGGElement;
  protected Content: TSVGElement;
  constructor(owner: Watermark, readonly ElementInfo: TElementInfo) {
    super(owner);
  }
  protected abstract setInfo(info: TElementInfo);
  setElementInfo(info: ElementInfo) {
    this.ElementInfo.Rotate = info.Rotate || 0;
    this.ElementInfo.Opacity = info.Opacity || 1;
    this.setInfo(info as TElementInfo);
  }
  getElementInfo(): ElementInfo {
    return this.ElementInfo;
  }
  protected initElement(): void {
    this.createGroupElement();
  }
  protected abstract getContentElement(): TSVGElement;

  getSVGElement(): SVGGraphicsElement {
    return this._groupElement;
  }

  protected updateTransform() {
    let value = "";
    if (this.Position.X != 0 || this.Position.Y != 0) {
      value += `translate(${this.Position.X} ${this.Position.Y}) `;
    }
    if (this.ElementInfo.Rotate != 0) {
      value += `rotate(${this.ElementInfo.Rotate}) `;
    }

    if (value !== "") {
      this._groupElement.setAttribute("transform", value);
    } else {
      this._groupElement.removeAttribute("transform");
    }

    if (this.ElementInfo.Opacity != 1) {
      this.Content.setAttribute("opacity", this.ElementInfo.Opacity.toString());
    } else {
      this.Content.removeAttribute("opacity");
    }
    this.updateBorder();
  }
  private createGroupElement() {
    this._groupElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this._groupElement.setAttribute("class", "wm-group");
    this._groupElement.setAttribute("visibility", "visible");
    this.Content = this.getContentElement();
    this._groupElement.appendChild(this.Content);
    this.Content.addEventListener("inactive", (e) => this.inActive());
    this.Content.addEventListener("click", (e) => {
      e.stopPropagation();
      this.Owner.setActiveElement(this);
    });
    this.createBorder();
    this.Content.addEventListener("move", (e) => {
      e.preventDefault();
      var d = (e as CustomEvent).detail as Position;
      this.Position.X += d.X;
      this.Position.Y += d.Y;
      this.updateTransform();
    });
  }
  private createBorder() {
    const element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    element.setAttribute("class", "wm-rect-box");
    element.setAttribute("visibility", "visible");
    element.setAttribute("draggable", "true");
    element.setAttribute("style", "fill-opacity: 0");

    this._borderElement = element;
    this._groupElement.appendChild(this._borderElement);
  }

  protected updateBorder() {
    const box: SVGRect = this.Content.getBBox();
    this._borderElement.setAttribute("height", box.height.toString());
    this._borderElement.setAttribute("width", box.width.toString());
    this._borderElement.setAttribute("x", box.x.toString());
    this._borderElement.setAttribute("y", box.y.toString());
  }
  active() {
    this.updateBorder();
    this._borderElement.setAttribute("class", "wm-rect-box wm-rect-select");
  }

  inActive() {
    this._borderElement.setAttribute("class", "wm-rect-box");
  }
}
