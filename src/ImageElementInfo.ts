import ElementInfo from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(readonly Data: string | ArrayBuffer, Rotate: number = 0) {
    super("LOGO", Rotate);
  }

  static fromDummyObject(obj: any | ImageElementInfo): ImageElementInfo {
    return new ImageElementInfo(obj.Data, obj.Rotate);
  }
}
