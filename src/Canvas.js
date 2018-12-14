import { HTMLCanvasElement, CanvasRenderingContext2D, WebGLRenderingContext } from './constructor'
import HTMLElement from './HTMLElement'
import document from './document'

let hasModifiedCanvasPrototype = false
let hasInit2DContextConstructor = false
let hasInitWebGLContextConstructor = false

let canvas = null;

export default function Canvas() {
  if (canvas != null) {
    return canvas;
  }
  canvas = swan.createCanvas()
  canvas.type = 'canvas'
  canvas.__proto__.__proto__ = new HTMLElement('canvas')
  const _getContext = canvas.getContext
  canvas.getBoundingClientRect = () => {
    const ret = {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight
    }
    return ret
  }
  canvas.focus = function () { };
  canvas.blur = function () { };
  canvas.addEventListener = function (type, listener) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // console.log('canvas.addEventListener', type);
    document.addEventListener(type, listener, options);
  };
  canvas.removeEventListener = function (type, listener) {
    // console.log('canvas.removeEventListener', type);
    document.removeEventListener(type, listener);
  };
  canvas.dispatchEvent = function () {
    var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    console.log('canvas.dispatchEvent', event.type, event);
    // nothing to do
  };
  return canvas
}
