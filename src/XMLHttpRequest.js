const _url = new WeakMap()
const _method = new WeakMap()
const _requestHeader = new WeakMap()
const _responseHeader = new WeakMap()
const _requestTask = new WeakMap()
const fs = swan.getFileSystemManager();

function _triggerEvent(type, ...args) {
  if (typeof this[`on${type}`] === 'function') {
    this[`on${type}`].apply(this, args)
  }
}

function _changeReadyState(readyState) {
  this.readyState = readyState
  _triggerEvent.call(this, 'readystatechange')
}

export default class XMLHttpRequest {
  // TODO 没法模拟 HEADERS_RECEIVED 和 LOADING 两个状态
  static UNSEND = 0
  static OPENED = 1
  static HEADERS_RECEIVED = 2
  static LOADING = 3
  static DONE = 4

  /*
   * TODO 这一批事件应该是在 XMLHttpRequestEventTarget.prototype 上面的
   */
  onabort = null
  onerror = null
  onload = null
  onloadstart = null
  onprogress = null
  ontimeout = null
  onloadend = null

  onreadystatechange = null
  readyState = 0
  response = null
  responseText = null
  responseType = ''
  responseXML = null
  status = 0
  statusText = ''
  upload = {}
  withCredentials = false

  constructor() {
    _requestHeader.set(this, {
      'content-type': 'application/x-www-form-urlencoded'
    })
    _responseHeader.set(this, {})
  }

  abort() {
    const myRequestTask = _requestTask.get(this)

    if (myRequestTask) {
      myRequestTask.abort()
    }
  }

  getAllResponseHeaders() {
    const responseHeader = _responseHeader.get(this)

    return Object.keys(responseHeader).map((header) => {
      return `${header}: ${responseHeader[header]}`
    }).join('\n')
  }

  getResponseHeader(header) {
    return _responseHeader.get(this)[header]
  }

  open(method, url/* async, user, password 这几个参数在小程序内不支持*/) {
    _method.set(this, method)
    _url.set(this, url)
    _changeReadyState.call(this, XMLHttpRequest.OPENED)
  }

  overrideMimeType() {
  }

  _isRelativePath(url) {
    return !/^(http|https|ftp|wxfile):\/\/.*/i.test(url);
  }

  _request(options) {
    let encoding = void 0;
    if (options.responseType === 'arraybuffer') {
      // encoding = 'binary'
    } else {
      encoding = 'utf8';
    }
    let relative = this._isRelativePath(options.url);
    if (relative) {
      // TODO 不确定在真机上是否有问题
      let paths = options.url.split('/output');
      let filePath = paths[0];
      if (paths.length > 1) {
        filePath = paths[1];
      }
      var readFileOptions = {
        'filePath': filePath,
        'success': options.success,
        'fail': options.fail
      };
      if (encoding) {
        options['encoding'] = encoding;
      }
      fs.readFile(readFileOptions);
      return;
    }
    swan.request(options);
  }

  send(data = '') {
    if (this.readyState !== XMLHttpRequest.OPENED) {
      throw new Error("Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.")
    } else {
      this._request({
        data,
        url: _url.get(this),
        method: _method.get(this),
        header: _requestHeader.get(this),
        responseType: this.responseType,
        success: ({ data, statusCode, header }) => {
          if (typeof data !== 'string' && !(data instanceof ArrayBuffer)) {
            try {
              data = JSON.stringify(data)
            } catch (e) {
              data = data
            }
          }

          this.status = statusCode
          _responseHeader.set(this, header)
          _triggerEvent.call(this, 'loadstart')
          _changeReadyState.call(this, XMLHttpRequest.HEADERS_RECEIVED)
          _changeReadyState.call(this, XMLHttpRequest.LOADING)

          this.response = data

          if (data instanceof ArrayBuffer) {
            this.responseText = ''
            const bytes = new Uint8Array(data)
            const len = bytes.byteLength

            for (let i = 0; i < len; i++) {
              this.responseText += String.fromCharCode(bytes[i])
            }
          } else {
            this.responseText = data
          }
          _changeReadyState.call(this, XMLHttpRequest.DONE)
          _triggerEvent.call(this, 'load')
          _triggerEvent.call(this, 'loadend')
        },
        fail: ({ errMsg }) => {
          // TODO 规范错误
          if (errMsg.indexOf('abort') !== -1) {
            _triggerEvent.call(this, 'abort')
          } else {
            _triggerEvent.call(this, 'error', errMsg)
          }
          _triggerEvent.call(this, 'loadend')
        }
      })
    }
  }

  setRequestHeader(header, value) {
    const myHeader = _requestHeader.get(this)

    myHeader[header] = value
    _requestHeader.set(this, myHeader)
  }
}
