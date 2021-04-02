import Watermark from "../Watermark/Watermark";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import Position from "../../models/Position";
import "./InteractiveElement.css";
import WatermarkElement from "../../models/WatermarkElement";

export default abstract class InteractiveElement extends WatermarkElement {
  private _borderElement: SVGRectElement;
  private _groupElement: SVGGElement;
  constructor(owner: Watermark, readonly Option: WatermarkElementOption) {
    super(owner);
  }

  protected initElement(): void {
    this.createGroupElement();
  }

  getSVGElement(): SVGElement {
    return this._groupElement;
  }
  private createGroupElement() {
    this._groupElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this._groupElement.setAttribute(
      "height",
      (this.Option.Height + 4).toString()
    );
    this._groupElement.setAttribute(
      "width",
      (this.Option.Width + 4).toString()
    );
    this._groupElement.setAttribute("x", "0");
    this._groupElement.setAttribute("y", "0");
    this._groupElement.setAttribute("visibility", "visible");
    this.Owner.addElement(this);

    const contentElement = this.getContentElement();
    this._groupElement.appendChild(contentElement);
    contentElement.addEventListener("inactive", (e) => this.Inactive());
    contentElement.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("click in element");
      this.Owner.setActiveElement(this);
    });
    this.createBorder();

    contentElement.addEventListener("move", (e) => {
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
    element.setAttribute("height", (this.Option.Height + 4).toString());
    element.setAttribute("width", (this.Option.Width + 4).toString());
    element.setAttribute("x", this.Option.XPosition.toString());
    element.setAttribute("y", this.Option.YPosition.toString());
    element.setAttribute("visibility", "visible");
    element.setAttribute("draggable", "true");
    element.setAttribute("style", "fill-opacity: 0");

    this._borderElement = element;
    this._groupElement.appendChild(this._borderElement);
  }

  protected abstract getContentElement(): SVGElement;

  Active() {
    this._borderElement.setAttribute("class", "wm-rect-box wm-rect-select");
  }

  Inactive() {
    this._borderElement.setAttribute("class", "wm-rect-box");
  }
}
