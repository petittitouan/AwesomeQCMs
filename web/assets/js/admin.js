import "../css/admin.css";
import Alpine from "alpinejs";
import { io, Socket } from "socket.io-client";

// Load FontAwesome
//import '@fortawesome/fontawesome-free/css/all.css'
import(/* webpackPreload: true */ '@fortawesome/fontawesome-free/js/all.js')

/**
 * @type {Socket}
 */
let socket = io('/admin', {
    transports: ['websocket'],
    autoConnect: false,
})

if (connect) {
    socket.connect()
}

window.Alpine = Alpine
Alpine.start()
