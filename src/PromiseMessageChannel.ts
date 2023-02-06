

export enum MessageType {
  Request = 'request',
  Response = 'response',
}

export interface IMessage<P = any> {
  _id: number
  payload: P
  sendRequestTime: Date
  channel: string
  type?: MessageType
  receiceRequestTime?: Date
  sendResponseTime?: Date
  receiceResponseTime?: Date
  sendResponse?: (payload?: any) => void
}
export interface IPromiseMeta {
  promise: Promise<IMessage>
  resolve: (value: any) => void
  reject: (reason?: any) => void
}

export interface IChannelOptions {
  sendMessage:  Function
  messageHandler?: (message: IMessage) => any
  senderId?: string
  messageChannel?: string
}

export default class PromiseMessageChannel {
  private _sendMessage: Function
  private messageId: number = 0
  private senderId: string = ''
  private promiseMap: Map<number, IPromiseMeta> = new Map()
  private messageChannel: string = 'PromiseChannel'
  private _messageHandler: (message: IMessage) => any
  constructor(options: IChannelOptions) {
    this._sendMessage = options.sendMessage
    this._messageHandler = options?.messageHandler || (() => {})
    this.senderId = options?.senderId || ''
    this.sendRequest = this.sendRequest.bind(this)
    this.messageHandler = this.messageHandler.bind(this)
    this.messageChannel = options?.messageChannel || this.messageChannel

  }
  public sendRequest(params: any): Promise<IMessage> {
    this.messageId++
    let item: IPromiseMeta = {} as IPromiseMeta
    const resPromise = new Promise<IMessage>((resolve, reject) => {
      item.resolve = resolve
      item.reject = reject
    })
    item.promise = resPromise
    this.promiseMap.set(this.messageId, item )
    this._sendMessage({
      _id: this.messageId,
      senderId: this.senderId,
      sendRequestTime: new Date(),
      payload: params,
      channel: this.messageChannel,
      type: MessageType.Request,
    })
    return resPromise
  }
  public messageHandler(message: IMessage) {
    if(message.channel === this.messageChannel && message.type === MessageType.Response) {
      const promiseItem = this.promiseMap.get(message._id)
      if(!promiseItem) {
        throw new Error('message id not found')
      }
      promiseItem.resolve({
        ...message,
        receiceResponseTime: new Date(),
      })
      this.promiseMap.delete(message._id)
    } else if(message.channel === this.messageChannel && message.type === MessageType.Request) {
      this._messageHandler({
        ...message,
        sendResponse: (payload) => {
          this._sendMessage({
            ...message,
            senderId: this.senderId,
            type: MessageType.Response,
            sendResponseTime: new Date(),
            channel: this.messageChannel,
            payload, // todo
          })
        },
      })
    }
  }

}
