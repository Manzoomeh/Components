import ImageInfo from "../../ImageInfo";
import WatermarkElement from "../models/WatermarkElement";
import Watermark from "../Watermark";
export default class ImageElement extends WatermarkElement<SVGImageElement> {
  addToUI() {
    super.addToUI();
    this.Owner.Element.setAttribute("height", this.imageInfo.Height.toString());
    this.Owner.Element.setAttribute("width", this.imageInfo.Width.toString());
  }
  constructor(owner: Watermark, readonly imageInfo: ImageInfo) {
    super(owner);
    this.Element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    this.Element.setAttribute("id", "m1");
    this.Element.setAttribute("height", imageInfo.Height.toString());
    this.Element.setAttribute("width", imageInfo.Width.toString());
    this.Element.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      (imageInfo.Data as any) as string
    );

    this.Element.setAttribute("x", "0");
    this.Element.setAttribute("y", "0");
    this.Element.setAttribute("visibility", "visible");

    //this.element = new SVGImageElement();
    //this.element.href = option.Content;

    this.Element.addEventListener('click',e=>{
      //owner.
    })
    this.addToUI();
  }
}
