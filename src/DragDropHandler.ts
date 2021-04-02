import { Position } from './components/models/Position';

export class DragDropHandler {
  ActiveElement: SVGElement = null;
  PreviuseLocation: Position;
  constructor(readonly Element: SVGElement) {
    this.Element.addEventListener('mousedown', startDrag);
    this.Element.addEventListener('mousemove', drag);
    this.Element.addEventListener('mouseup', endDrag);
    this.Element.addEventListener('mouseleave', endDrag);

    function startDrag(event) {
      this.ActiveElement = event.target;
      this.PreviuseLocation = Position.CreateFromEvent(event);
      console.log('start', this.PreviuseLocation);
    }

    function drag(event) {
      if (this.ActiveElement) {
        event.preventDefault();
        const now = Position.CreateFromEvent(event);
        const change = this.PreviuseLocation.GetDistance(now);
        this.PreviuseLocation = now;
        const moveEvent = new CustomEvent('move', { detail: change });
        this.ActiveElement.dispatchEvent(moveEvent);
        //console.log('move', change, this.ActiveElement);
      }
    }
    function endDrag(evt) {
      this.ActiveElement = null;
      console.log('end');
    }
  }
}
