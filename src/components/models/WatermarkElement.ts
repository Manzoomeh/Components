import Watermark from "../Watermark";

export default abstract class WatermarkElement<T extends SVGElement> {
  Element: T;
  constructor(readonly Owner: Watermark) {}

  addToUI() {
    this.Owner.Element.appendChild(this.Element);
  }
}

// class InterActiveElement<T extends SVGElement> extends WatermarkElement<T> {
//   constructor(owner: Watermark) {
//     super(owner);
//   }
// }
