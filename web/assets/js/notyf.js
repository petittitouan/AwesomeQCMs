import { Notyf } from 'notyf'
import 'notyf/notyf.min.css'

let instance = null

export default function getNotyf() {
    if (instance !== null) return instance
    instance = new Notyf({
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
    return instance
}
