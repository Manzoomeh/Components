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
    //textElement.setAttribute("height", this.imageInfo.Height.toString());
    //textElement.setAttribute("width", this.imageInfo.Width.toString());
    textElement.setAttribute("font-family", this.imageInfo.FontName);
    textElement.setAttribute("font-size", "30");
    textElement.setAttribute("dominant-baseline", "text-before-edge");
    textElement.setAttribute("x", (this.Option.XPosition + 2).toString());
    textElement.setAttribute("y", (this.Option.YPosition + 2).toString());
    textElement.setAttribute("visibility", "visible");
    textElement.textContent = this.imageInfo.Text;
    console.log(textElement.clientHeight,textElement.clientWidth);
    return textElement;
  }

  static ToOption(imageInfo: TextElementInfo): WatermarkElementOption {
    return new WatermarkElementOption(imageInfo.Width, imageInfo.Height, 0, 0);
  }
}
