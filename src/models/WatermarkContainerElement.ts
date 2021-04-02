import Watermark from "../components/Watermark/Watermark";
import WatermarkElement from "./WatermarkElement";

export default abstract class WatermarkContainerElement<
  T extends SVGElement
> extends WatermarkElement {
  Element: T;
  constructor(owner: Watermark) {
    super(owner);
  }

  getSVGElement(): SVGElement {
    return this.Element;
  }
}
