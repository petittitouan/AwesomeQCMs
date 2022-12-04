import { PrismaClient } from '@prisma/client'
import { Namespace } from 'socket.io'
import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getPath(filePath: string): string {
    return path.join(__dirname, 'web', filePath)
}

//TODO: Verify the Turnstile Token with Cloudflare
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

export default function (db: PrismaClient, io: Namespace): Router {
    const router = Router()

    //TODO: Show Page

    router.get('/', (req, res) => {
        res.sendFile(getPath('index.html'))
    })

    return router
}
