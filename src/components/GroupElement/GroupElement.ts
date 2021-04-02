import ImageInfo from '../../ImageInfo';

export class GroupElement {
  Element: SVGGElement;
  constructor(imageInfo: ImageInfo) {
    this.Element = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    this.Element.setAttribute('id', 'm1');
    this.Element.setAttribute('height', imageInfo.Height.toString());
    this.Element.setAttribute('width', imageInfo.Width.toString());
    this.Element.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'href',
      (imageInfo.Data as any) as string
    );

    this.Element.setAttribute('x', '0');
    this.Element.setAttribute('y', '0');
    this.Element.setAttribute('visibility', 'visible');
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

    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('visibility', 'visible');
    return image;
  }
}
