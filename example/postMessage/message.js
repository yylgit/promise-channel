import PromiseMessageChannel from '../../dist/es/index.js';


export function initChannel(targetWindow, senderId) {
  const receivedMessageDom = document.querySelector('#receivedMessage')
  const sendSuccessMessageDom = document.querySelector('#sendSuccessMessage')
  const sendTextDom = document.querySelector('#sendText')
  const channel = new PromiseMessageChannel({
   senderId,
   sendMessage: (message) => {
    targetWindow.postMessage(message, '*')
   },
   messageHandler(message) {
    receivedMessageDom.innerHTML = receivedMessageDom.innerHTML + `<p>${message.payload}</p>`
    message.sendResponse()
   }
  })

  window.addEventListener('message', function(event) {
    channel.messageHandler(event.data)
  });

  document.querySelector('#sendMessageBtn').addEventListener('click', () => {
    const value = sendTextDom.value
    if(value) {
      channel.sendRequest(value).then(res=>{
        sendSuccessMessageDom.innerHTML = sendSuccessMessageDom.innerHTML + `<p>${value}</p>`
      })
      sendTextDom.value = ''
    } else {
      alert('Please input message')
    }

  })

  return channel
}