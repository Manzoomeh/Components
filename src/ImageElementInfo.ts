import ElementInfo  from "./ElementInfo";

export default class ImageElementInfo extends ElementInfo {
  constructor(
    readonly Data: string | ArrayBuffer,
     width: number,
     height: number
  ) {
    super(width,height);
  }
}


