import Watermark from "../Watermark/Watermark";
import ImageElementInfo from "../../ImageElementInfo";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import InteractiveElement from "../Interactive/InterActiveElement";

export default class LogoElement extends InteractiveElement<SVGImageElement,ImageElementInfo> {
  constructor(owner: Watermark, imageInfo: ImageElementInfo) {
    super(owner,imageInfo, LogoElement.ToOption(imageInfo));
    this.initElement()
  }
  protected getContentElement():SVGImageElement {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    image.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      (this.ElementInfo.Data as any) as string
    );
    image.setAttribute("visibility", "visible");
    return image;
    
  }

  static ToOption(imageInfo: ImageElementInfo): WatermarkElementOption {
    return new WatermarkElementOption(0,0, 0, 0);
  }
}
