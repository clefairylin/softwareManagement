import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnection,
} from '@microsoft/signalr'


function zeroism(num: number, size = 2): string {
  return String(num).padStart(size, '0');
}

function formatDateTime(date: Date): string {
  return date.getFullYear() + '-'
    + zeroism(date.getMonth() + 1) + '-'
    + zeroism(date.getDate()) + ' '
    + zeroism(date.getHours()) + ':'
    + zeroism(date.getMinutes()) + ':'
    + zeroism(date.getSeconds()) + '.'
    + zeroism(date.getMilliseconds(), 3)
}

export enum EventHanlder {
  ON_CONNECTED = 'ON_CONNECTED',
  ON_RECONNECTING = 'ON_RECONNECTING',
  ON_RECONNECTED = 'ON_RECONNECTED',
  ON_CLOSE = 'ON_CLOSE'
}

interface Respone<T> {
  CurrItem: string
  FunctionName: string
  IsSucc: boolean
  RequestId: string
  Tag: T
  err_code: number
  err_msg: string
}

export default class Connect {
  public hub: HubConnection
  private eventHandler: Record<string, any> = {}
  private ignoreLog: Array<string> = ['GetLeds']
  private waitingResponse: Record<string, string> = {}
  private requestCallbacks: Record<string, any> = {}
  private notifyCallbacks: Record<string, any[]> = {}

  constructor(url: string, portals: string[]) {
    this.hub = new HubConnectionBuilder()
      .configureLogging(LogLevel.Debug)
      .withUrl(url, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build()
    this.__onWatchConnectState__()
    this.__register__(portals)
  }

  run() {
    return new Promise((resolve, reject) => {
      if (this.hub) {
        this.__connect__(resolve)
      } else {
        reject('HubConnection Not Initialized Yet.')
      }
    })
  }

  invoke<T = any>(portal: string, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.__createUUID__()
      this.waitingResponse[portal] = requestId
      this.requestCallbacks[requestId] = (data: Respone<T>) => {
        if (data.err_code === 0 && !data.err_msg) {
          resolve(data.Tag)
        } else {
          const errorInfo = {
            code: data.err_code,
            msg: data.err_msg
          }
          console.log('%c ************* invoke error *************:', 'color:#ff0606;', errorInfo)
          reject(errorInfo)
        }
      }
      console.log(
        `%c${formatDateTime(new Date())} send request【${portal} - ${requestId}】${params.length > 0 ? ', params:' : ''}`,
        'color:#0cf;',
        ...params
      )
      this.hub.invoke('GetTaskAsync', JSON.stringify({
        functionName: portal,
        requestId,
        parms: params.length > 0 ? params : null
      }))
    })
  }

  // 订阅通知
  subscribe<T = any>(portal: string, callback: (data: T) => any) {
    if (!this.notifyCallbacks[portal]) {
      this.notifyCallbacks[portal] = []
    }
    this.notifyCallbacks[portal].push(callback)
  }

  // 当前是否有订阅
  hasSubscribe(portal: string): boolean {
    return this.notifyCallbacks[portal] && this.notifyCallbacks[portal].length > 0
  }

  // 取消订阅
  unsubscribe(portal: string) {
    delete this.notifyCallbacks[portal]
  }

  // 注册回调
  setEventHanlder(handler: { [key in EventHanlder]?: any }) {
    this.eventHandler = { ...handler }
  }

  __createUUID__() {
    let d = Date.now()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x03) | 0x08).toString(16)
    })
  }

  __register__(portals: string[]) {
    for (let i = portals.length; i--;) {
      this.hub.on(portals[i], (data: string) => this.__handleResponse__(JSON.parse(data)))
    }
  }

  __handleResponse__(data: Respone<any>) {
    const { FunctionName: portal, RequestId } = data
    if (!data.RequestId) {
      // handle notify
      !this.ignoreLog.includes(portal) && console.log(
        `%c${formatDateTime(new Date())} notify【${portal}】:`,
        'color:#b71aa0;',
        data
      )
      if (this.notifyCallbacks[portal]) {
        const callbacks = this.notifyCallbacks[portal]
        for (let i = callbacks.length; i--;) {
          const callback = callbacks[i]
          callback && typeof callback === 'function' && callback(data.Tag, data.CurrItem)
        }
      }
    } else if (Object.values(this.waitingResponse).includes(RequestId) && this.requestCallbacks[RequestId]) {
      console.log(
        `%c${formatDateTime(new Date())} response【${portal} - ${RequestId}】:`,
        'color:#0a0;',
        data
      )
      const callback = this.requestCallbacks[RequestId]
      callback && typeof callback === 'function' && callback(data)
      delete this.requestCallbacks[RequestId]
    }
  }

  __onWatchConnectState__() {
    // when the connection is closed
    this.hub.onclose(() => {
      this.__connect__()
      this.__handleConnectEvent__(EventHanlder.ON_CLOSE)
    })
    // when the connection starts reconnecting
    this.hub.onreconnecting(() => {
      console.log('尝试重连', this.hub.state)
      this.__handleConnectEvent__(EventHanlder.ON_RECONNECTING)
    })
    // when the connection successfully reconnects
    this.hub.onreconnected(() => {
      this.__handleConnectEvent__(EventHanlder.ON_RECONNECTED)
    })
  }

  // 尝试连接
  __connect__(cb?: (value?: unknown) => void) {
    this.hub
      .start()
      .then(() => {
        console.log('连接成功')
        if (cb) {
          cb()
        } else {
          this.__handleConnectEvent__(EventHanlder.ON_CONNECTED)
        }
      })
      .catch(err => {
        console.log('reconnect error', err)
        setTimeout(() => this.__connect__(cb), 2000)
      })
  }

  __handleConnectEvent__(type: EventHanlder) {
    if (this.eventHandler[type] && typeof this.eventHandler[type] === 'function') {
      this.eventHandler[type]()
    }
  }
}
