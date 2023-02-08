

export enum MessageType {
  Request = 'request',
  Response = 'response',
}

export interface IMessage<IRequestPayload, IResponsePayload> {
  _id: number
  payload: IRequestPayload | IResponsePayload
  channel: string
  senderId: string
  type: MessageType
  sendRequestTime: Date
  receiceRequestTime?: Date
  sendResponseTime?: Date
  receiceResponseTime?: Date
  sendResponse?: (payload?: IResponsePayload) => void
}

type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};


export type IHandleMessage<R, S> = WithRequiredProperty<IMessage<R, S>, 'sendResponse' | 'receiceRequestTime'>

export interface IPromiseMeta {
  promise: Promise<any>
  resolve: (value: any) => void
  reject: (reason?: any) => void
}

export interface IChannelOptions<R, S> {
  sendMessage:   (message: IMessage<R, S>) => any
  messageHandler?: (message: IHandleMessage<R, S>) => any
  senderId?: string
  messageChannel?: string
}

export default class PromiseMessageChannel<IRequestPayload = any, IResponsePayload = any> {
  private _sendMessage: (message: IMessage<IRequestPayload, IResponsePayload>) => any
  private messageId: number = 0
  private senderId: string = ''
  private promiseMap: Map<number, IPromiseMeta> = new Map()
  private messageChannel: string = 'PromiseChannel'
  private _messageHandler: (message: IHandleMessage<IRequestPayload, IResponsePayload>) => any
  constructor(options: IChannelOptions<IRequestPayload, IResponsePayload>) {
    this._sendMessage = options.sendMessage
    this._messageHandler = options?.messageHandler || (() => {})
    this.senderId = options?.senderId || ''
    this.sendRequest = this.sendRequest.bind(this)
    this.messageHandler = this.messageHandler.bind(this)
    this.messageChannel = options?.messageChannel || this.messageChannel

  }
  public sendRequest(params: IRequestPayload): Promise<IMessage<IRequestPayload, IResponsePayload>> {
    this.messageId++
    let item: IPromiseMeta = {} as IPromiseMeta
    const resPromise = new Promise<IMessage<IRequestPayload, IResponsePayload>>((resolve, reject) => {
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
  public messageHandler(message: IMessage<IRequestPayload, IResponsePayload>) {
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
      message.receiceResponseTime = new Date()
      const handlerMessage = {
        ...message,
        sendResponse: (payload: IResponsePayload) => {
          this._sendMessage({
            ...message,
            senderId: this.senderId,
            type: MessageType.Response,
            sendResponseTime: new Date(),
            channel: this.messageChannel,
            payload,
          })
        },
      } as IHandleMessage<IRequestPayload, IResponsePayload>
      this._messageHandler(handlerMessage)
    }
  }

}
