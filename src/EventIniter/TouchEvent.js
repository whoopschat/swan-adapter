import * as window from '../window'
import document from '../document'
import { noop } from '../util/'

class TouchEvent {
  target = window.canvas
  currentTarget = window.canvas
  touches = []
  targetTouches = []
  changedTouches = []
  preventDefault = noop
  stopPropagation = noop
  constructor(type) {
    this.type = type
  }
}

function touchEventHandlerFactory(type) {
  return (event) => {
    const touchEvent = new TouchEvent(type)

    touchEvent.touches = event.touches
    touchEvent.targetTouches = Array.prototype.slice.call(event.touches)
    touchEvent.changedTouches = event.changedTouches
    touchEvent.timeStamp = event.timeStamp
    document.dispatchEvent(touchEvent)
  }
}

swan.onTouchStart(touchEventHandlerFactory('touchstart'))
swan.onTouchMove(touchEventHandlerFactory('touchmove'))
swan.onTouchEnd(touchEventHandlerFactory('touchend'))
swan.onTouchCancel(touchEventHandlerFactory('touchcancel'))
