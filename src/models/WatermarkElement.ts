import Watermark from "../components/Watermark/Watermark";
import ElementInfo from "../ElementInfo";

export default abstract class WatermarkElement {
  constructor(readonly Owner: Watermark) {}
  abstract getSVGElement(): SVGGraphicsElement;
  active() {}
  inActive() {}
  abstract getElementInfo(): ElementInfo;
  abstract setElementInfo(info: ElementInfo);
}
