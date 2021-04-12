import ElementInfo from "../../ElementInfo";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import TextElementInfo from "../../TextElementInfo";
import InteractiveElement from "../Interactive/InterActiveElement";
import Watermark from "../Watermark/Watermark";

export class TextElement extends InteractiveElement<
  SVGTextElement,
  TextElementInfo
> {
  setInfo(info: TextElementInfo) {
    this.ElementInfo.Color = info.Color;
    this.ElementInfo.FontFamily = info.FontFamily;
    this.ElementInfo.FontSize = info.FontSize;
    this.ElementInfo.Text = info.Text;
    this.updateElementFromElementInfo();
  }

  constructor(owner: Watermark, textInfo: TextElementInfo) {
    super(owner, textInfo);
    this.initElement();
    this.updateElementFromElementInfo();
  }

  private updateElementFromElementInfo() {
    this.Content.setAttribute("font-family", this.ElementInfo.FontFamily);
    this.Content.setAttribute(
      "font-size",
      this.ElementInfo.FontSize.toString()
    );
    this.Content.setAttribute("fill", this.ElementInfo.Color);
    this.Content.textContent = this.ElementInfo.Text;
    this.updateTransform();
  }
  protected getContentElement(): SVGTextElement {
    const textElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textElement.setAttribute("fill", this.ElementInfo.Color);
    textElement.setAttribute("dominant-baseline", "text-before-edge");
    textElement.setAttribute("x", this.Position.X.toString());
    textElement.setAttribute("y", this.Position.Y.toString());
    textElement.setAttribute("visibility", "visible");
    return textElement;
  }
}
