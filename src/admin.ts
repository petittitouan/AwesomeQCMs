import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Namespace } from 'socket.io'
import { json, Response, Router } from 'express'
import session, { Session } from 'express-session'
import { OAuth2Client } from 'google-auth-library'
import { NextFunction, Request } from 'express-serve-static-core'

declare module 'http' {
    // noinspection JSUnusedGlobalSymbols
    interface IncomingMessage {
        session: Session & {
            authenticated: boolean
        }
    }
}

const SESSION_MAX_AGE = 1000 * 60 * 60 * 6 // 6 hours

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const googlePublicKeys = (await googleClient.getFederatedSignonCertsAsync())
    .certs

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

    router.use(json())

    router.post('/login/callback', async (req, res) => {
        if (!req.body) {
            return void res.sendStatus(400)
        }
        try {
            const loginTicket =
                await googleClient.verifySignedJwtWithCertsAsync(
                    req.body.google_jwt,
                    googlePublicKeys,
                    process.env.GOOGLE_CLIENT_ID,
                    // @ts-ignore
                    [process.env.GOOGLE_JWT_ISSUER]
                )
            const payload = loginTicket.getPayload()
            if (payload?.email_verified === false)
                return void res.sendStatus(403)

            const teacher = await db.teacher.upsert({
                where: {
                    email: payload?.email,
                },
                update: {
                    fullName: payload?.name,
                    avatar: payload?.picture,
                },
                create: {
                    // @ts-ignore
                    email: payload?.email,
                    // @ts-ignore
                    fullName: payload?.name,
                    avatar: payload?.picture,
                },
            })
            req.session.authenticated = true
            Object.assign(req.session, {
                teacherId: teacher.id,
                accountCreatedAt: teacher.createdAt,
                email: teacher.email,
                fullName: teacher.fullName,
                avatar: teacher.avatar,
                darkMode: teacher.darkmode,
            })
            console.log(teacher)
            res.sendStatus(204)
        } catch (e) {
            console.log(e)
            res.sendStatus(401)
        }
    })

    router.get('/', (req, res) => {
        if (req.session.authenticated) {
            return res.redirect('/admin/dashboard')
        }
        res.redirect('/admin/login')
    })

    router.get('/:page', (req, res, next) => {
        if (req.params.page === 'logout') next()

        if (req.session.authenticated) {
            if (req.params.page === 'login') {
                return res.redirect('/admin/dashboard')
            }
        } else {
            if (req.params.page !== 'login') {
                return res.redirect('/admin/login')
            }
        }

        res.render('admin', {
            page: req.params.page,
            session: req.session,
        })
    })

    router.get('/logout', (req, res) => {
        const sessionId = req.session.id

        req.session.destroy(() => {
            // disconnect all Socket.IO connections linked to this session ID
            io.to(sessionId).emit('logout')
            io.to(sessionId).disconnectSockets()
            res.redirect('/#admin-logout-success')
        })
    })

    return router
}
