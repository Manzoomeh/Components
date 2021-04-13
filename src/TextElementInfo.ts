import ElementInfo, { TileMode } from "./ElementInfo";

export default class TextElementInfo extends ElementInfo {
  constructor(
    public Text: string,
    public FontFamily: string,
    public FontSize: number,
    public Color: string,
    rotate: number,
    opacity: number,
    tileMode: TileMode,
    span: number
  ) {
    super("TEXT", rotate, opacity, tileMode, span);
  }

  static fromDummyObject(obj: any | TextElementInfo): TextElementInfo {
    return new TextElementInfo(
      obj.Text,
      obj.FontFamily,
      obj.FontSize,
      obj.Color || "black",
      obj.Rotate || 0,
      obj.Opacity || 1,
      obj.TileMode || "NONE",
      obj.Span || 0
    );
  }
}
