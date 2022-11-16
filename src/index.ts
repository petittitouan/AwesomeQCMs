import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

import studentRouter from './student.js'
import adminRouter from './admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getPath(filePath: string): string {
    return path.join(__dirname, 'web', filePath)
}

const prisma = new PrismaClient()

const app = express()
const srv = http.createServer(app)
const io = new Server(srv, {
    transports: ['websocket'],
    serveClient: false,
})

app.set('view engine', 'ejs')
app.set('views', getPath('views'))
app.use('/assets', express.static(getPath('assets')))

io.on('connection', (socket) => {
    console.log('Socket Connected')

    setTimeout(() => {
        console.log('Emitting')
        // random emit 'registered' or 'wrongCode'
        socket.emit('authenticated', Math.random() > 0.5)
        socket.disconnect()
    }, 1000)

    socket.on('disconnect', () => {
        console.log('Socket Disconnected')
    })
})

app.use(studentRouter(prisma, io.of('/')))
app.use('/admin', adminRouter(prisma, io.of('/admin')))

app.get('/', (req, res) => {
    res.sendFile(getPath('index.html'))
})

srv.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`)
})

//
// const prisma = new PrismaClient()
// const user = await prisma.teacher.create({
//     data: {
//         name: "Alice",
//         email: "hey",
//     },
// })

//TODO Express & SocketIO
