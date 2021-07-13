function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')
    //"this" guarantees that the variable will be outside the function, available on DOM

    const cover = newElement('div', 'cover')
    const shape = newElement('div', 'shape')
    this.element.appendChild(reverse ? shape : cover)
    this.element.appendChild(reverse ? cover : shape)

    this.setNewHeight = newHeight => shape.style.height = `${newHeight}px`
}

// const b = new Barrier(true)
// b.setNewHeight(300)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function PairOfBarriers(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.upper = new Barrier(true)
    this.lower = new Barrier(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.lower.element)

    this.sortOpening = () => {
        const upperHeight = Math.random() * (height - opening)
        const lowerHeight = height - opening - upperHeight
        this.upper.setNewHeight(upperHeight)
        this.lower.setNewHeight(lowerHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.sortOpening()
    this.setX(x)
}

// const b = new PairOfBarriers(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barriers(height, width, opening, space, notificatePoint) {
    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + space),
        new PairOfBarriers(height, opening, width + space * 2),
        new PairOfBarriers(height, opening, width + space * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            //when the element leaves game area (width < 0)
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.sortOpening()
            }
            
            const middle = width / 2
            const crossedMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if (crossedMiddle) notificatePoint()
        })
    }
} 

function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'Imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const generateY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (generateY <= 0)
            this.setY(0)
        else if (generateY >= maxHeight)
            this.setY(maxHeight)
        else
            this.setY(generateY)
    }

    this.setY(gameHeight / 2)
}



const barriers = new Barriers(700, 1100, 200, 400)
const bird = new Bird(700)
const gameArea = document.querySelector('[wm-flappy]')

gameArea.appendChild(bird.element)
barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))
setInterval(() => {
    barriers.animate()
    bird.animate()
}, 20)
