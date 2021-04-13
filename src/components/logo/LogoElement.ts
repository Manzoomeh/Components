import Watermark from "../Watermark/Watermark";
import ImageElementInfo from "../../ImageElementInfo";
import { WatermarkElementOption } from "../../models/WatermarkElementOption";
import InteractiveElement from "../Interactive/InterActiveElement";

export default class LogoElement extends InteractiveElement<
  SVGImageElement,
  ImageElementInfo
> {
  setInfo(info: ImageElementInfo) {
    this.ElementInfo.Scale = info.Scale || 1;
    this.updateElementFromElementInfo();
  }
  constructor(owner: Watermark, private readonly imageInfo: ImageElementInfo) {
    super(owner, imageInfo);
    this.initElement();
    this.updateElementFromElementInfo();
  }
  private updateElementFromElementInfo() {
    if (this.ElementInfo.Scale != 1) {
      var newHeight = this.imageInfo.Height * this.ElementInfo.Scale;
      this.Content.setAttribute("height", newHeight.toString());
    } else {
      this.Content.removeAttribute("height");
    }
    this.updateTransform();
  }

  protected getContentElement(): SVGImageElement {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    image.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      (this.ElementInfo.Data as any) as string
    );
    image.setAttribute("visibility", "visible");
    return image;
  }
}
