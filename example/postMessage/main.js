import {initChannel} from './message.js'


initChannel(document.querySelector('#frame').contentWindow, 'main')