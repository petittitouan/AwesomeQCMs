import getNotyf from '../notyf.js'

import '../../css/admin/login.css'

function googleCallback(response) {
    fetch('/admin/login/callback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            google_jwt: response.credential,
        }),
    }).then((response) => {
        // If code is 403 email is not verified
        if (response.status === 403) {
            return void getNotyf().error(
                "Votre adresse email Google n'est pas vérifiée"
            )
        }
        getNotyf().success('Connexion réussie !')
        setTimeout(() => {
            window.location.href = '/admin'
        }, 1000)
    })
}

function googlePromptCallback(notification) {
    // https://developers.google.com/identity/gsi/web/reference/js-reference#google.accounts.id.prompt
    const googleLoginBtn = document.getElementById('googleLoginBtn')
    if (notification.isDisplayed()) {
        googleLoginBtn.style.display = 'block'
        googleLoginBtn.disabled = true
        googleLoginBtn.innerText = "Utilisez l'invite Google en haut à droite"
    } else {
        googleLoginBtn.style.display = 'none'
        // https://developers.google.com/identity/gsi/web/reference/js-reference#google.accounts.id.renderButton
        // noinspection JSUnresolvedVariable,JSUnresolvedFunction
        google.accounts.id.renderButton(
            document.getElementById('generatedGoogleLoginBtn'),
            {
                theme: 'filled_black',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
            }
        )
    }
}

function initGoogleLogin() {
    // noinspection JSUnresolvedVariable,SpellCheckingInspection
    google.accounts.id.initialize({
        client_id: process.env.GOOGLE_CLIENT_ID,
        callback: googleCallback,
        auto_select: true,
        cancel_on_tap_outside: false,
    })
    // noinspection JSUnresolvedVariable
    google.accounts.id.prompt(googlePromptCallback)
}

// Exec on doc ready (perhaps already ready)
if (document.readyState !== 'loading') {
    initGoogleLogin()
} else {
    document.addEventListener('DOMContentLoaded', initGoogleLogin)
}
