import ElementInfo from "./ElementInfo";

export default class TextElementInfo extends ElementInfo {
  constructor(
    readonly Text: string,
    readonly FontName: string,
    width: number,
    height: number
  ) {
    super(width, height);
  }
}
