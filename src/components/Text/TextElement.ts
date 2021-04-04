import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import TextElementInfo from "../../TextElementInfo";
import InteractiveElement from "../Interactive/InterActiveElement";
import Watermark from "../Watermark/Watermark";

export class TextElement extends InteractiveElement<
  SVGTextElement,
  TextElementInfo
> {
  constructor(owner: Watermark, textInfo: TextElementInfo) {
    super(owner, textInfo, TextElement.ToOption(textInfo));
    this.initElement();
  }
  protected getContentElement(): SVGTextElement {
    const textElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textElement.setAttribute("font-family", this.ElementInfo.FontFamily);
    textElement.setAttribute("font-size", this.ElementInfo.FontSize.toString());
    textElement.setAttribute("fill", this.ElementInfo.Color);
    textElement.setAttribute("dominant-baseline", "text-before-edge");
    textElement.setAttribute("x", this.Option.XPosition.toString());
    textElement.setAttribute("y", this.Option.YPosition.toString());
    textElement.setAttribute("visibility", "visible");
    textElement.textContent = this.ElementInfo.Text;
    return textElement;
  }

  static ToOption(imageInfo: TextElementInfo): WatermarkElementOption {
    return new WatermarkElementOption(0, 0, 0, 0);
  }
}
