export class Position {
  constructor(readonly X: number, readonly Y: number) {}

  GetDistance(from: Position): Position {
    return new Position(from.X - this.X, from.Y - this.Y);
  }
  static CreateFromEvent(event: MouseEvent): Position {
    return new Position(event.clientX, event.clientY);
  }
}
