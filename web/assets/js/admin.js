import "../css/admin.css";
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

if (connectSocket) {
    socket.connect()
}

switch (page) {
    case 'login':
        import(/* webpackPrefetch: true */ './admin/login.js')
    case 'dashboard':
        import(/* webpackPrefetch: true */ './admin/dashboard.js')
}
