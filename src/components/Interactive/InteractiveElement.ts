import Watermark from "../Watermark/Watermark";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import Position from "../../models/Position";
import "./InteractiveElement.css";
import WatermarkElement from "../../models/WatermarkElement";

export default abstract class InteractiveElement<
  T extends SVGGraphicsElement
> extends WatermarkElement {
  private _borderElement: SVGRectElement;
  private _groupElement: SVGGElement;
  protected Content: T;
  constructor(owner: Watermark, readonly Option: WatermarkElementOption) {
    super(owner);
  }

  protected initElement(): void {
    this.createGroupElement();
  }
  protected abstract getContentElement(): T;

  getSVGElement(): SVGGraphicsElement {
    return this._groupElement;
  }
  private createGroupElement() {
    this._groupElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this._groupElement.setAttribute("visibility", "visible");

    this.Content = this.getContentElement();
    this._groupElement.appendChild(this.Content);
    this.Content.addEventListener("inactive", (e) => this.Inactive());
    this.Content.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("click in element");
      this.Owner.setActiveElement(this);
    });
    this.createBorder();

    this.Content.addEventListener("move", (e) => {
      e.preventDefault();

      var d = (e as CustomEvent).detail as Position;
      this.Option.XPosition += d.X;
      this.Option.YPosition += d.Y;
      this._groupElement.setAttribute(
        "transform",
        `translate(${this.Option.XPosition} ${this.Option.YPosition})`
      );
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

  Active() {
    const box: SVGRect = this.Content.getBBox();
    this._borderElement.setAttribute("height", box.height.toString());
    this._borderElement.setAttribute("width", box.width.toString());
    this._borderElement.setAttribute("x", box.x.toString());
    this._borderElement.setAttribute("y", box.y.toString());
    this._borderElement.setAttribute("class", "wm-rect-box wm-rect-select");
  }

  Inactive() {
    this._borderElement.setAttribute("class", "wm-rect-box");
  }
}
