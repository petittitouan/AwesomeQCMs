import { io, Socket } from 'socket.io-client'

// Load Bootstrap CSS & JS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'

// Load Notyf
import getNotyf from './notyf.js'
// Load Galaxy Background
import './galaxy.js'

// Load Custom CSS
import '../css/index.css'

const notyf = getNotyf()

// Load FontAwesome
//import '@fortawesome/fontawesome-free/css/all.css'
import(/* webpackPreload: true */ '@fortawesome/fontawesome-free/js/all.js')

if (window.location.hash === '#admin-logout-success') {
    notyf.success({
        message: 'Déconnexion réussie !',
        duration: 5000,
    })
    window.location.hash = ''
}

/**
 * @type {Socket}
 */
let socket = io({ transports: ['websocket'], autoConnect: false })

let turnstileToken = null
let turnstileWidgetId = null

const qcmCodeField = document.getElementById('qcmCode')
const firstNameField = document.getElementById('firstName')
const lastNameField = document.getElementById('lastName')
const joinButton = document.getElementById('joinQcm')

function getConnectionData() {
    return {
        qcmCode: qcmCodeField.value,
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        turnstileToken: turnstileToken,
    }
}

/**
 * @param {Element} elem
 * @param {boolean} valid
 */
function applyValidationClasses(elem, valid) {
    if (valid) {
        elem.classList.remove('is-invalid')
        elem.classList.add('is-valid')
    } else {
        elem.classList.remove('is-valid')
        elem.classList.add('is-invalid')
    }
}

function validateQcmCode(event) {
    applyValidationClasses(event.target, /^\d{6}$/.test(event.target.value))
}

function validateFirstName(event) {
    applyValidationClasses(
        event.target,
        /^([^\d\W]|-|[\u00C0-\u00FF]){2,}$/.test(event.target.value)
    )
}

function validateLastName(event) {
    applyValidationClasses(
        event.target,
        /^([^\d\W]|\s|-|[\u00C0-\u00FF]){2,}$/.test(event.target.value)
    )
}

function isFormValid() {
    validateQcmCode({ target: qcmCodeField })
    validateFirstName({ target: firstNameField })
    validateLastName({ target: lastNameField })
    return (
        document.querySelectorAll('.is-invalid').length === 0 &&
        turnstileToken !== null
    )
}

qcmCodeField.addEventListener('focus', validateQcmCode)
qcmCodeField.addEventListener('keydown', validateQcmCode)
qcmCodeField.addEventListener('keyup', validateQcmCode)

firstNameField.addEventListener('focus', validateFirstName)
firstNameField.addEventListener('keydown', validateFirstName)
firstNameField.addEventListener('keyup', validateFirstName)

lastNameField.addEventListener('focus', validateLastName)
lastNameField.addEventListener('keydown', validateLastName)
lastNameField.addEventListener('keyup', validateLastName)

joinButton.addEventListener('click', async (event) => {
    const originalText = joinButton.innerHTML
    joinButton.disabled = true
    joinButton.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'

    const restoreState = () => {
        joinButton.disabled = false
        joinButton.innerHTML = originalText
    }

    if (!isFormValid()) {
        notyf.error('Raté !')
        return void restoreState()
    }

    const connecting = notyf.open({
        type: 'loading',
        message: 'Connexion au QCM...',
        duration: 10000,
    })

    socket.once('authenticated', (validCode) => {
        notyf.dismiss(connecting)
        if (validCode) {
            notyf.success('Connecté au QCM !')
            //TODO Hide Form (div#qcmLogin) and show loader with "En attente du démarrage du QCM..."
            turnstile.remove(turnstileWidgetId)
        } else {
            notyf.error('Code QCM incorrect !')
            qcmCodeField.value = ''
            qcmCodeField.classList.remove('is-valid')
            qcmCodeField.classList.add('is-invalid')
            turnstile.reset(turnstileWidgetId)
        }
        restoreState()
    })
    socket.auth = (cb) => cb(getConnectionData())
    socket.connect()
})

window.onloadTurnstileCallback = () => {
    turnstileWidgetId = turnstile.render(
        document.getElementById('turnstileContainer'),
        {
            sitekey: process.env.TURNSTILE_SITE_KEY,
            theme: 'dark',
            size: 'normal',
            callback: (token) => {
                turnstileToken = token
            },
        }
    )
}
