import process from "process";
import PromiseMessageChannel from "../../src/index";
import { fork } from "child_process";
import http from 'http'
import path from 'path'

const cp1 = fork(path.join(__dirname, "./child1"));
const cp2 = fork(path.join(__dirname, "./child2"));


const channel1 = new PromiseMessageChannel({
  senderId: "main",
  sendMessage: cp1.send.bind(cp1),
  messageHandler
});
cp1.on('message', channel1.messageHandler)

const channel2 = new PromiseMessageChannel({
  senderId: "main",
  sendMessage: cp2.send.bind(cp2),
  messageHandler
});
cp2.on('message', channel2.messageHandler)

function messageHandler(message: any) {
  console.log('main receive message: ', message)
  if (message.payload.to === "main") {
    return message.sendResponse({event: 'res from main'})
  }

  if(message.payload.to === 'child1') {
    channel1.sendRequest(message.payload).then(res=>{
      message.sendResponse(res.payload)
    })
  }

  if(message.payload.to === 'child2') {
    channel2.sendRequest(message.payload).then(res=>{
      message.sendResponse(res.payload)
    })
  }
}

http.createServer((req, res)=>{
  console.log('main receive request: ', req.url)
  switch(req.url) {
    case '/sendtochild1':
    channel1.sendRequest({event: 'hello'}).then((message)=>{
        res.end(JSON.stringify(message))
      })
      break;
    case '/sendtochild2':
      channel2.sendRequest({event: 'hello'}).then((message)=>{
        res.end(JSON.stringify(message))
      })
      break;
    default: 
      res.end('main')
  }
  
}).listen(8000,()=>{
  console.log('main server start at 8000');
})

process.on("exit",()=>{
  cp1.kill()
  cp2.kill()
})
