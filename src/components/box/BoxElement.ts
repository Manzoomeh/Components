import { SelectableElement } from '../SelectatbleElement/SelectableElement';
import WatermarkElement from '../models/WatermarkElement';
import './BoxElement.css';

//extends SVGChildElement<SVGRectElement>
export default class BoxElement<
  T extends SVGElement
> extends WatermarkElement<SVGRectElement> {
  constructor(owner: SelectableElement<T>) {
    super(owner.Owner);
    this.Element = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    this.Element.setAttribute('class', 'wm-rect-box');
    this.Element.setAttribute('height', (owner.Option.Height + 4).toString());
    this.Element.setAttribute('width', (owner.Option.Width + 4).toString());

    this.Element.setAttribute('x', (owner.Option.XPosition - 2).toString());
    this.Element.setAttribute('y', (owner.Option.YPosition - 2).toString());
    this.Element.setAttribute('visibility', 'visible');

    this.Element.setAttribute('draggable', 'true');

    // this.Element.addEventListener("inactive", (e) => this.Inactive());
    // this.Element.addEventListener("active", (e) => this.Active());
  }

  Active() {
    this.Element.setAttribute('class', 'wm-rect-box wm-rect-select');
  }

  Inactive() {
    this.Element.setAttribute('class', 'wm-rect-box');
  }
}
