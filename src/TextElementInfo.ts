import ElementInfo from "./ElementInfo";

export default class TextElementInfo extends ElementInfo {
  constructor(
    public Text: string,
    public FontFamily: string,
    public FontSize: number,
    public Color: string,
    Rotate: number = 0
  ) {
    super("TEXT", Rotate, 1);
  }

  static fromDummyObject(data: any | TextElementInfo): TextElementInfo {
    return new TextElementInfo(
      data.Text,
      data.FontFamily,
      data.FontSize,
      data.Color,
      data.Rotate || 0
    );
  }
}
