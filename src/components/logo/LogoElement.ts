import Watermark from '../Watermark';
import ImageInfo from '../../ImageInfo';
import { WatermarkElementOption } from '../models/WatermarkElementOption';
import { SelectableElement } from '../SelectatbleElement/SelectableElement';
import '../box/BoxElement.css';
import { Position } from '../models/Position';

class p{
  
}
export default class LogoElement extends SelectableElement<SVGGElement> {
  //element: SVGImageElement;
  private _borderElement: SVGRectElement;
  constructor(owner: Watermark, readonly imageInfo: ImageInfo) {
    super(owner, LogoElement.ToOption(imageInfo));
    this.Element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //this.Element.setAttribute('id', 'm1');
    this.Element.setAttribute('height', (imageInfo.Height + 4).toString());
    this.Element.setAttribute('width', (imageInfo.Width + 4).toString());

    this.Element.setAttribute('x', '0');
    this.Element.setAttribute('y', '0');
    this.Element.setAttribute('visibility', 'visible');

    this.Element.appendChild(this.CreateImage(imageInfo));
    this.createBorder();
    //this.element = new SVGImageElement();
    //this.element.href = option.Content;

    this.addToUI();
  }

  private createBorder() {
    const element = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    element.setAttribute('class', 'wm-rect-box');
    element.setAttribute('height', (this.Option.Height + 4).toString());
    element.setAttribute('width', (this.Option.Width + 4).toString());
    element.setAttribute('x', (this.Option.XPosition).toString());
    element.setAttribute('y', (this.Option.YPosition).toString());
    element.setAttribute('visibility', 'visible');

    element.setAttribute('draggable', 'true');

    element.setAttribute('style','fill-opacity: 0')
    this._borderElement = element;

    this.Element.appendChild(this._borderElement);

    this.Element.addEventListener('inactive', (e) => this.Inactive());
    this.Element.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('click in element');
      this.Active();
    });
  }
  private CreateImage(imageInfo: ImageInfo) {
    const image = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image'
    );
    image.setAttribute('id', 'm1');
    image.setAttribute('height', imageInfo.Height.toString());
    image.setAttribute('width', imageInfo.Width.toString());
    image.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      (imageInfo.Data as any) as string
    );

    image.setAttribute('x', (this.Option.XPosition+2).toString());
    image.setAttribute('y', (this.Option.YPosition+2).toString());
    image.setAttribute('visibility', 'visible');

    image.addEventListener('move', (e) => {
      e.preventDefault();
      var d = (e as CustomEvent).detail as Position;
      //console.log('move:', d);
      this.Option.XPosition += d.X;
      this.Option.YPosition += d.Y;
      this.Element.setAttribute("transform",`translate(${this.Option.XPosition} ${this.Option.YPosition})`)
      // this.Element.setAttribute('x', this.Option.XPosition.toString());
      // this.Element.setAttribute('y', this.Option.YPosition.toString());
    });
    return image;
  }

  Active() {
    this._borderElement.setAttribute('class', 'wm-rect-box wm-rect-select');
  }

  Inactive() {
    this._borderElement.setAttribute('class', 'wm-rect-box');
  }

  static ToOption(imageInfo: ImageInfo): WatermarkElementOption {
    return new WatermarkElementOption(imageInfo.Width, imageInfo.Height, 0, 0);
  }
}

// export default class LogoElement extends SelectableElement<SVGImageElement> {
//   //element: SVGImageElement;
//   constructor(owner: Watermark, readonly imageInfo: ImageInfo) {
//     super(owner, LogoElement.ToOption(imageInfo));
//     this.Element = document.createElementNS(
//       'http://www.w3.org/2000/svg',
//       'image'
//     );
//     this.Element.setAttribute('id', 'm1');
//     this.Element.setAttribute('height', imageInfo.Height.toString());
//     this.Element.setAttribute('width', imageInfo.Width.toString());
//     this.Element.setAttributeNS(
//       'http://www.w3.org/1999/xlink',
//       'href',
//       (imageInfo.Data as any) as string
//     );

//     this.Element.setAttribute('x', '0');
//     this.Element.setAttribute('y', '0');
//     this.Element.setAttribute('visibility', 'visible');

//     //this.element = new SVGImageElement();
//     //this.element.href = option.Content;
//     this.addToUI();
//   }

//   static ToOption(imageInfo: ImageInfo): WatermarkElementOption {
//     return new WatermarkElementOption(imageInfo.Width, imageInfo.Height, 0, 0);
//   }
// }
