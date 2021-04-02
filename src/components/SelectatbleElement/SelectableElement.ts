import BoxElement from '../box/BoxElement';
import Watermark from '../Watermark';
import { WatermarkElementOption } from '../models/WatermarkElementOption';
import WatermarkElement from '../models/WatermarkElement';
import { Position } from '../models/Position';

export class SelectableElement<
  T extends SVGElement
> extends WatermarkElement<T> {
  //_boxElement: BoxElement<T>;
  constructor(owner: Watermark, readonly Option: WatermarkElementOption) {
    super(owner);
    //this._boxElement = new BoxElement<T>(this);
  }
  addToUI(): void {
    this.Element.addEventListener('move', (e) => {
      e.preventDefault();
      var d = (e as CustomEvent).detail as Position;
      //console.log('move:');
      this.Option.XPosition += d.X;
      this.Option.YPosition += d.Y;
      this.Element.setAttribute('x', this.Option.XPosition.toString());
      this.Element.setAttribute('y', this.Option.YPosition.toString());
    });
    this.Element.setAttribute('data-wm-element', '');
    this.Element.setAttribute('draggable', 'true');
    super.addToUI();
    this.Element.addEventListener('select-item', (e) => console.log(e));
    // this.Element.addEventListener('inactive', (e) =>
    //   this._boxElement.Inactive()
    // );
    // this.Element.addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   console.log('click in element');
    //   this._boxElement.Active();
    // });
    // this._boxElement.addToUI();
  }
}
