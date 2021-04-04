import ElementInfo from "./ElementInfo";

export default class TextElementInfo extends ElementInfo {
  constructor(
    readonly Text: string,
    readonly FontFamily: string,
    readonly FontSize: number,
    readonly Color:string
  ) {
    super('TEXT')
  }
}


