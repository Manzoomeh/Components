import Watermark from "../components/Watermark/Watermark";

export default abstract class WatermarkElement {
  constructor(readonly Owner: Watermark) {}
  abstract getSVGElement(): SVGElement;
  Active(){}
  Inactive(){}
}
