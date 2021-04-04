import ElementInfo from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(
    readonly Data: string | ArrayBuffer,
    Rotate: number = 0,
    Scale: number = 1,
    public Width: number,
    public Height: number,
    Opacity: number = 1
  ) {
    super("LOGO", Rotate, Scale, Opacity);
  }

  static fromDummyObject(obj: any | ImageElementInfo): ImageElementInfo {
    return new ImageElementInfo(
      obj.Data,
      obj.Rotate,
      obj.Scale,
      obj.Width,
      obj.height,
      obj.Opacity || 1
    );
  }
}
