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

function PairSet(height, width, opening, space, notificatePoint) {
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
        const changeY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (changeY <= 0)
            this.setY(0)
        else if (changeY >= maxHeight)
            this.setY(maxHeight)
        else
            this.setY(changeY)
    }

    this.setY(gameHeight / 2)
}

function areOverlaid(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function colided(bird, pairSet) {
    let colided = false
    pairSet.pairs.forEach(pairOfBarriers => {
        if (!colided) {
            const upper = pairOfBarriers.upper.element
            const lower = pairOfBarriers.lower.element
            colided = areOverlaid(bird.element, upper)
                || areOverlaid(bird.element, lower)
        }
    })
    return colided
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const pairSet = new PairSet(height, width, 200, 400,
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    pairSet.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            pairSet.animate()
            bird.animate()

            if (colided(bird, pairSet)){
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()
