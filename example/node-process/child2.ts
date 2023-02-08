import http from 'http'
import PromiseMessageChannel from "../../src/index";
import {IMessagePayload} from "./types";

const channel = new PromiseMessageChannel<IMessagePayload, IMessagePayload>({
  senderId: 'child1',
  sendMessage: process.send?.bind(process)!,
  messageHandler: (message) => {
    console.log('child2 receive message: ', message)
    message.sendResponse({event: 'res from child2'})
  }
})
process.on('message', channel.messageHandler)

http.createServer((req, res)=>{
  console.log('child2 receive request: ', req.url)
  switch(req.url) {
    case '/sendtochild1':
      channel.sendRequest({event: 'hello', to: 'child1'}).then((message)=>{
        res.end(JSON.stringify(message))
      })
      break;
    case '/sendtomain':
      channel.sendRequest({event: 'hello', to: 'main'}).then((message)=>{
        res.end(JSON.stringify(message))
      })
      break;
    default:
      res.end('child2')
  }
}).listen(8002,()=>{
  console.log('child1 server start at 8002');
})