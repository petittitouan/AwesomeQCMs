import '../css/galaxy.css'

const starCount = 500
const maxTime = 31
const universe = document.getElementById('universe')

function findWidthAndHeight() {
    let width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
    let height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
    return {
        width,
        height,
    }
}

function fillGalaxy() {
    const { width, height } = findWidthAndHeight()
    for (let i = 0; i < starCount; ++i) {
        // noinspection SpellCheckingInspection
        const ypos = Math.round(Math.random() * height)
        const star = document.createElement('div')
        const speed = 1000 * (Math.random() * maxTime + 1)
        // noinspection GrazieInspection
        star.setAttribute(
            'class',
            'star star' + (3 - Math.floor(speed / 1000 / 8))
        )
        star.style.backgroundColor =
            'rgb(' +
            Math.round(Math.random() * 255) +
            ', ' +
            Math.round(Math.random() * 255) +
            ', ' +
            Math.round(Math.random() * 255) +
            ')'
        // noinspection JSCheckFunctionSignatures
        universe.appendChild(star)
        star.animate(
            [
                {
                    transform:
                        'translate3d(' + width + 'px, ' + ypos + 'px, 0)',
                },
                {
                    transform:
                        'translate3d(-' +
                        Math.random() * 256 +
                        'px, ' +
                        ypos +
                        'px, 0)',
                },
            ],
            {
                delay: Math.random() * -speed,
                duration: speed,
                iterations: Infinity,
            }
        )
    }
}

fillGalaxy()

let fillTimeout = null
addEventListener('resize', () => {
    universe.innerHTML = ''
    clearTimeout(fillTimeout)
    fillTimeout = setTimeout(fillGalaxy, 100)
})
