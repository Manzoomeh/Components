import ElementInfo from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(
    readonly Data: string | ArrayBuffer,
    Rotate: number = 0,
    Scale: number = 1
  ) {
    super("LOGO", Rotate, Scale);
  }

  static fromDummyObject(obj: any | ImageElementInfo): ImageElementInfo {
    return new ImageElementInfo(obj.Data, obj.Rotate, obj.Scale);
  }
}
