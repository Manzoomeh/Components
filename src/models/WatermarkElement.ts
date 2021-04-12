import Watermark from "../components/Watermark/Watermark";
import ElementInfo from "../ElementInfo";
import Position from "./Position";

export default abstract class WatermarkElement {
  protected Position: Position;
  constructor(readonly Owner: Watermark) {
    this.Position = new Position(0, 0);
  }
  abstract getSVGElement(): SVGGraphicsElement;
  active() {}
  inActive() {}
  abstract getElementInfo(): ElementInfo;
  abstract setElementInfo(info: ElementInfo);
  abstract remove(): void;
}
