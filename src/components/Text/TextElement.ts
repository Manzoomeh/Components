import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import TextElementInfo from "../../TextElementInfo";
import InteractiveElement from "../Interactive/InterActiveElement";
import Watermark from "../Watermark/Watermark";

export class TextElement extends InteractiveElement<SVGTextElement> {
  constructor(owner: Watermark, readonly imageInfo: TextElementInfo) {
    super(owner, TextElement.ToOption(imageInfo));
    this.initElement();
  }
  protected getContentElement(): SVGTextElement {
    const textElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textElement.setAttribute("font-family", this.imageInfo.FontName);
    textElement.setAttribute("font-size", "30");
    textElement.setAttribute("dominant-baseline", "text-before-edge");
    textElement.setAttribute("x", this.Option.XPosition.toString());
    textElement.setAttribute("y", this.Option.YPosition.toString());
    textElement.setAttribute("visibility", "visible");
    textElement.textContent = this.imageInfo.Text;
    console.log(textElement.clientHeight,textElement.clientWidth);
    return textElement;
  }

  static ToOption(imageInfo: TextElementInfo): WatermarkElementOption {
    return new WatermarkElementOption(0,0, 0, 0);
  }
}
