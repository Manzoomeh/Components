import ElementInfo from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(
    readonly Data: string | ArrayBuffer,
    Rotate: number = 0,
    public Scale: number,
    public Width: number,
    public Height: number,
    Opacity: number = 1
  ) {
    super("LOGO", Rotate, Opacity);
  }

  static fromDummyObject(obj: any | ImageElementInfo): ImageElementInfo {
    return new ImageElementInfo(
      obj.Data,
      obj.Rotate || 0,
      obj.Scale || 1,
      obj.Width,
      obj.Height,
      obj.Opacity || 1
    );
  }
}
