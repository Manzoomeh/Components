import ElementInfo from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(readonly Data: string | ArrayBuffer) {
    super("LOGO");
  }

  static fromDummyObject(obj: any | ImageElementInfo): ImageElementInfo {
    return new ImageElementInfo(obj.Data);
  }
}
