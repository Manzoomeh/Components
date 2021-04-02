import LogoElement from './logo/LogoElement';
import { IOption } from './IOptions';
import WatermarkElement from './models/WatermarkElement';
import ImageElement from './Image/ImageElement';
import ImageInfo from '../ImageInfo';
import { SelectableElement } from './SelectatbleElement/SelectableElement';
import { DragDropHandler } from '../DragDropHandler';

export default class Watermark {
  static readonly DOMURL: any = window.URL || window.webkitURL || window;
  Element: SVGElement;
  readonly Image: ImageElement;
  readonly Elements: Array<SelectableElement<SVGRectElement>>;
  readonly dragDropHandler: DragDropHandler;
  constructor(readonly option: IOption) {
    this.Element = option.SvgElement;
    this.Elements = new Array<SelectableElement<SVGRectElement>>();
    this.Image = new ImageElement(this, option.ImageInfo);

    const eventAwesome = new CustomEvent('select-item', {
      bubbles: true,
      detail: { text: '() => textarea.value' },
    });

    //setInterval(()=> this.element.dispatchEvent(eventAwesome),3000);
    this.Element.addEventListener('click', (e) => {
      console.log('select in root');
      this.Element.dispatchEvent(new CustomEvent('select-item'));
    });
    this.Element.addEventListener('select-item', (e) => {
      this.Element.querySelectorAll('[data-wm-element]').forEach((element) => {
        //if(element)
        element.dispatchEvent(new CustomEvent('inactive'));
      });
    });
    //console.log(this.Image.element);
    this.dragDropHandler = new DragDropHandler(this.Element);
    //this.initDragSetting();
  }
  //_p: any = null;
  //_pre: any;
  // private initDragSetting() {
  //   this.Element.addEventListener('mousedown', startDrag);
  //   this.Element.addEventListener('mousemove', drag);
  //   this.Element.addEventListener('mouseup', endDrag);
  //   this.Element.addEventListener('mouseleave', endDrag);

  //   function startDrag(evt) {
  //     this._p = evt.target;

  //     this._pre = { x: evt.clientX, y: evt.clientY };
  //     console.log('start', this._pre);
  //   }
  //   function drag(evt) {
  //     if (this._p) {
  //       evt.preventDefault();
  //       //var x = parseFloat(this.Element.getAttributeNS(null, "x"));
  //       //this.Element.setAttributeNS(null, "x", x + 0.1);
  //       const now = { x: evt.clientX, y: evt.clientY };
  //       const change = { x: this._pre.x - now.x, y: this._pre.y - now.y };
  //       this._pre = now;
  //       console.log('move', change);
  //     }
  //   }
  //   function endDrag(evt) {
  //     this._p = null;
  //     console.log('end');
  //   }
  // }
  addImageElement(imageInfo: ImageInfo) {
    new LogoElement(this, imageInfo);
    //this.Elements.push(new LogoElement(this, imageInfo));
  }

  // exportImage(): string {
  //   const data = new XMLSerializer().serializeToString(this.element);
  //   console.log(data);
  //   var img = new Image();
  //   var svg = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  //   var canvas = document.createElement("canvas");
  //   var ctx = canvas.getContext("2d");
  //   img.onload = function () {
  //     ctx.drawImage(img, 0, 0);
  //     //Watermark.DOMURL.revokeObjectURL(url);
  //     var png_img = canvas.toDataURL("image/png");
  //     return png_img;
  //   };

  //   img.src = url;
  //   return Watermark.DOMURL.createObjectURL(svg);
  // }

  preview(img: HTMLImageElement) {
    const data = new XMLSerializer().serializeToString(this.Element);
    var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    img.src = Watermark.DOMURL.createObjectURL(svg);
  }

  exportImage(): Promise<void> {
    const container = this;
    const data = new XMLSerializer().serializeToString(this.Element);
    var img = new Image();

    var canvas = document.createElement('canvas');
    canvas.width = this.Image.imageInfo.Width;
    canvas.height = this.Image.imageInfo.Height;
    var ctx = canvas.getContext('2d');
    this.preview(img);
    return new Promise<void>((resolve, reject) => {
      img.onload = function () {
        ctx.drawImage(img, 0, 0);
        var png_img = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.setAttribute('href', png_img);
        a.setAttribute('download', 'fileName.jpeg');
        a.click();
        resolve();
      };
    });
  }
}
