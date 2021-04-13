import ElementInfo, { TileMode } from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(
    readonly Data: string | ArrayBuffer,
    rotate: number,
    public Scale: number,
    public Width: number,
    public Height: number,
    opacity: number,
    tileMode: TileMode,
    span: number
  ) {
    super("LOGO", rotate, opacity, tileMode, span);
  }

  static fromDummyObject(obj: any | ImageElementInfo): ImageElementInfo {
    return new ImageElementInfo(
      obj.Data,
      obj.Rotate || 0,
      obj.Scale || 1,
      obj.Width,
      obj.Height,
      obj.Opacity || 1,
      obj.TileMode,
      obj.Span
    );
  }
}
