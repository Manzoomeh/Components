import ImageElementInfo from "../../ImageElementInfo";
import WatermarkElement from "../../models/WatermarkElement";
import Watermark from "../Watermark/Watermark";
export default class MainImageElement extends WatermarkElement {
  private _imageElement:SVGImageElement;
  getSVGElement(): SVGElement {
    return this._imageElement;
  }

  constructor(owner: Watermark, readonly imageInfo: ImageElementInfo) {
    super(owner);
    this._imageElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    this._imageElement.setAttribute("height", this.imageInfo.Height.toString());
    this._imageElement.setAttribute("width", this.imageInfo.Width.toString());
    this._imageElement.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      (this.imageInfo.Data as any) as string
    );

    this._imageElement.setAttribute("x", "0");
    this._imageElement.setAttribute("y", "0");
    this._imageElement.setAttribute("visibility", "visible");
    this.Owner.Element.setAttribute("height", this.imageInfo.Height.toString());
    this.Owner.Element.setAttribute("width", this.imageInfo.Width.toString());
    this.Owner.addElement(this);
  }
}
