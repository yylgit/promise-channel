import http from 'http'
import PromiseMessageChannel from "../../src/index";

const channel = new PromiseMessageChannel({
  senderId: 'child1',
  sendMessage: process.send?.bind(process)!,
  messageHandler: (message: any) => {
    console.log('child1 receive message: ', message)
    message.sendResponse({event: 'res from child1'})
  }
})
process.on('message', channel.messageHandler)

http.createServer((req, res)=>{
  console.log('child1 receive request: ', req.url)
  switch(req.url) {
    case '/sendtochild2':
      channel.sendRequest({event: 'hello', to: 'child2'}).then((message)=>{
        res.end(JSON.stringify(message))
      })
      break;
    case '/sendtomain':
      channel.sendRequest({event: 'hello', to: 'main'}).then((message)=>{
        res.end(JSON.stringify(message))
      })
      break;
    default:
      res.end('child1')
  }
}).listen(8001,()=>{
  console.log('child1 server start at 8001');
})

