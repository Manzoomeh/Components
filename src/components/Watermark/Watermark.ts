import LogoElement from "../logo/LogoElement";
import { IOption } from "./IOptions";
import MainImageElement from "../MainImage/MainImageElement";
import ImageElementInfo from "../../ImageElementInfo";
import { DragDropHandler } from "../../DragDropHandler";
import WatermarkElement from "../../models/WatermarkElement";
import { TextElement } from "../Text/TextElement";
import TextElementInfo from "../../TextElementInfo";

export default class Watermark {
  static readonly DOMURL: any = window.URL || window.webkitURL || window;
  Element: SVGElement;
  readonly Image: MainImageElement;
  readonly Elements: Array<WatermarkElement>;
  readonly dragDropHandler: DragDropHandler;
  constructor(readonly option: IOption) {
    this.Element = option.SvgElement;
    this.Elements = new Array<WatermarkElement>();
    this.Image = new MainImageElement(this, option.ImageInfo);

    const eventAwesome = new CustomEvent("select-item", {
      bubbles: true,
      detail: { text: "() => textarea.value" },
    });

    this.Element.addEventListener("click", (e) => {
      console.log("select in root");
      this.setActiveElement();
    });
    this.Element.addEventListener("select-item", (e) => {
      this.Element.querySelectorAll("[data-wm-element]").forEach((element) => {
        element.dispatchEvent(new CustomEvent("inactive"));
      });
    });
    this.dragDropHandler = new DragDropHandler(this.Element);
  }
  setActiveElement(ActiveElement?: WatermarkElement) {
    this.Elements.forEach((element) => {
      if (element == ActiveElement) {
        element.Active();
      } else {
        element.Inactive();
      }
    });
  }

  addElement(element: WatermarkElement) {
    this.Elements.push(element);
    this.Element.appendChild(element.getSVGElement());
  }
  addImageElement(imageInfo: ImageElementInfo) {
   const logo = new LogoElement(this, imageInfo);
   this.addElement(logo);
  }

  addTextElement(textInfo:TextElementInfo){
    const text = new TextElement(this, textInfo);
    this.addElement(text);
  }

  preview(img: HTMLImageElement) {
    const data = new XMLSerializer().serializeToString(this.Element);
    var svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    img.src = Watermark.DOMURL.createObjectURL(svg);
  }

  exportImage(): Promise<void> {
    const container = this;
    const data = new XMLSerializer().serializeToString(this.Element);
    var img = new Image();

    var canvas = document.createElement("canvas");
    canvas.width = this.Image.imageInfo.Width;
    canvas.height = this.Image.imageInfo.Height;
    var ctx = canvas.getContext("2d");
    this.preview(img);
    return new Promise<void>((resolve, reject) => {
      img.onload = function () {
        ctx.drawImage(img, 0, 0);
        var png_img = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.setAttribute("href", png_img);
        a.setAttribute("download", "fileName.jpeg");
        a.click();
        resolve();
      };
    });
  }
}
