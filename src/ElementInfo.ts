export type ElementType = "TEXT" | "LOGO" | "IMAGE";

export default class ElementInfo {
  constructor(
    readonly Type: ElementType,
    public Rotate: number,
    public Scale: number
  ) {}
}
