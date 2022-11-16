import { io, Socket } from "socket.io-client";

// Load Bootstrap CSS & JS
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
// Load Notyf
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

// Load Galaxy Background
import "./galaxy.js";

// Load Custom CSS
import "../css/index.css";

// Load FontAwesome
//import '@fortawesome/fontawesome-free/css/all.css'
import(/* webpackPreload: true */ '@fortawesome/fontawesome-free/js/all.js')

/**
 * @type {Socket}
 */
let socket = io({ transports: ['websocket'], autoConnect: false })

const notyf = new Notyf({
    dismissible: true,
    duration: 2500,
    position: {
        x: 'right',
        y: 'top',
    },
    ripple: true, // Appear/Disappear Animation
    types: [
        {
            type: 'error',
            icon: {
                className: 'fa-solid fa-circle-xmark',
                tagName: 'i',
                color: 'white',
            },
        },
        {
            type: 'success',
            icon: {
                className: 'fa-solid fa-circle-check',
                tagName: 'i',
                color: 'white',
            },
        },
        {
            type: 'loading',
            icon: {
                className: 'fa-solid fa-cog fa-spin',
                tagName: 'i',
                color: 'white',
            },
            background: 'orangered',
        },
    ],
})

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
    return document.querySelectorAll('.is-invalid').length === 0
}

const qcmCodeField = document.getElementById('qcmCode')
const firstNameField = document.getElementById('firstName')
const lastNameField = document.getElementById('lastName')
const joinButton = document.getElementById('joinQcm')

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
        } else {
            notyf.error('Code QCM incorrect !')
            qcmCodeField.value = ''
            qcmCodeField.classList.remove('is-valid')
            qcmCodeField.classList.add('is-invalid')
        }
        restoreState()
    })

    socket.connect()
})
