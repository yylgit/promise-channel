构造函数的参数

sendMessage 发送消息的方法

messageHandler 消息的处理函数

senderId 用户标识的发送者id

messageChannel 用户标识的channel名称 


IMessage 定义了消息的的字段

_id 消息的唯一id

type 这个消息是请求 还是返回

payload 用户的数据

定义一些时间点

IPromiseMeta 定义了每一个请求的promise数据

promiseMap 存所有的请求


sendRequest 返回promise对象


messageHandler 是需要用户绑定的消息处理方法

如果是请求 则给消息体添加上sendResponse 方法 然后调用用户自己的消息处理方法

用户自己控制何时 sendResponse 


如果消息类型是response 则对promise进行resolve