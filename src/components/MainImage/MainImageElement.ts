import ImageElementInfo from "../../ImageElementInfo";
import WatermarkContainerElement from "../../models/WatermarkContainerElement";
import Watermark from "../Watermark/Watermark";
export default class MainImageElement extends WatermarkContainerElement<SVGImageElement> {

  constructor(owner: Watermark, readonly imageInfo: ImageElementInfo) {
    super(owner);
    this.Element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    this.Element.setAttribute("height", this.imageInfo.Height.toString());
    this.Element.setAttribute("width", this.imageInfo.Width.toString());
    this.Element.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      (this.imageInfo.Data as any) as string
    );

    this.Element.setAttribute("x", "0");
    this.Element.setAttribute("y", "0");
    this.Element.setAttribute("visibility", "visible");
    this.Owner.Element.setAttribute("height", this.imageInfo.Height.toString());
    this.Owner.Element.setAttribute("width", this.imageInfo.Width.toString());
    this.Owner.addElement(this);
  }
}
