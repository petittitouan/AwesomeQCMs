import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Namespace } from 'socket.io'
import { Response, Router } from 'express'
import session, { Session } from 'express-session'
import { NextFunction, Request } from 'express-serve-static-core'

declare module 'http' {
    interface IncomingMessage {
        session: Session & {
            authenticated: boolean
        }
    }
}

const SESSION_MAX_AGE = 1000 * 60 * 60 * 6 // 6 hours

export default function (db: PrismaClient, io: Namespace): Router {
    const router = Router()

    const sessionMiddleware = session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: 'auto',
            maxAge: SESSION_MAX_AGE,
        },
    })
    router.use(sessionMiddleware)

    io.use((socket, next) => {
        sessionMiddleware(
            socket.request as Request,
            {} as Response,
            next as NextFunction
        )
    })

    // Only allow authenticated users
    io.use((socket, next) => {
        const session = socket.request.session
        if (session && session.authenticated) {
            next()
        } else {
            next(new Error('unauthorized'))
        }
    })

    io.on('connection', (socket) => {
        // To handle Logout
        const sessionId = socket.request.session.id
        socket.join(sessionId)

        // Session Expiration
        const timer = setInterval(() => {
            socket.request.session.reload((err) => {
                if (err) {
                    socket.emit('logout')
                    socket.disconnect()
                }
            })
        }, SESSION_MAX_AGE)
    })

    // TODO: Implement Authentication

    router.get('/', (req, res) => {
        res.redirect('/admin/login')
    })

    router.get('/:page', (req, res, next) => {
        if (['logout'].includes(req.params.page)) next()
        res.render('admin', {
            page: req.params.page,
        })
    })

    //TODO: GET /login with google login

    router.get('/logout', (req, res) => {
        const sessionId = req.session.id

        req.session.destroy(() => {
            // disconnect all Socket.IO connections linked to this session ID
            io.to(sessionId).disconnectSockets()
            res.redirect('/admin')
        })
    })

    return router
}
