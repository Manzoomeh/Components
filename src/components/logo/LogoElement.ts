import Watermark from "../Watermark/Watermark";
import ImageElementInfo from "../../ImageElementInfo";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import InteractiveElement from "../Interactive/InterActiveElement";

export default class LogoElement extends InteractiveElement<SVGImageElement> {
  constructor(owner: Watermark, readonly imageInfo: ImageElementInfo) {
    super(owner, LogoElement.ToOption(imageInfo));
    this.initElement()
  }
  protected getContentElement():SVGImageElement {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    //image.setAttribute("height", this.imageInfo.Height.toString());
    //image.setAttribute("width", this.imageInfo.Width.toString());
    image.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      (this.imageInfo.Data as any) as string
    );

    image.setAttribute("x", (this.Option.XPosition + 2).toString());
    image.setAttribute("y", (this.Option.YPosition + 2).toString());
    image.setAttribute("visibility", "visible");
    return image;
    
  }

  static ToOption(imageInfo: ImageElementInfo): WatermarkElementOption {
    return new WatermarkElementOption(imageInfo.Width, imageInfo.Height, 0, 0);
  }
}
