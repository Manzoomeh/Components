import ElementInfo from "./ElementInfo";

export default class TextElementInfo extends ElementInfo {
  constructor(
    public Text: string,
    public FontFamily: string,
    public FontSize: number,
    public Color: string,
    Rotate: number = 0,
    Opacity: number = 1
  ) {
    super("TEXT", Rotate, Opacity);
  }

  static fromDummyObject(obj: any | TextElementInfo): TextElementInfo {
    return new TextElementInfo(
      obj.Text,
      obj.FontFamily,
      obj.FontSize,
      obj.Color || "black",
      obj.Rotate || 0,
      obj.Opacity || 1
    );
  }
}
