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

    const bg = newElement('img', 'draw')
    bg.src = 'Imgs/drawing1.png'
    shape.appendChild(bg)
    
    this.setNewWidth = newWidth => shape.style.width = `${newWidth}px`
    this.setBg = nW => bg.style.width =  `${nW}px`
}

function PairOfBarriers(width, opening, y) {
    this.element = newElement('div', 'pair-of-barriers')

    this.leftSide = new Barrier(true)
    this.rightSide = new Barrier(false)

    this.element.appendChild(this.leftSide.element)
    this.element.appendChild(this.rightSide.element)

    this.sortOpening = () => {
        const leftWidth = Math.random() * (width - opening)
        const rightWidth = width - opening - leftWidth
        this.leftSide.setNewWidth(leftWidth)
        this.rightSide.setNewWidth(rightWidth)
        this.leftSide.setBg(leftWidth)
        this.rightSide.setBg(rightWidth)

    }

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`
    this.getHeight = () => this.element.clientHeight

    this.sortOpening()
    this.setY(y)
}

function PairSet(width, height, opening, space, notificatePoint) {
    this.pairs = [
        new PairOfBarriers(width, opening, height),
        new PairOfBarriers(width, opening, height + space),
        new PairOfBarriers(width, opening, height + space * 2),
        new PairOfBarriers(width, opening, height + space * 3)
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setY(pair.getY() - displacement)

            //when the element leaves game area (width < 0)
            if (pair.getY() < -pair.getHeight()) {
                pair.setY(pair.getY() + space * this.pairs.length)
                pair.sortOpening()
            }
            
            const middle = height / 2 - 140
            const crossedMiddle = pair.getY() + displacement >= middle
                && pair.getY() < middle
            if (crossedMiddle) notificatePoint()
        })
    }
} 

function Bird(gameWidth) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'Imgs/passaro.png'

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const changeX = this.getX() + (flying ? 8 : -8)
        const maxWidth = gameWidth - this.element.clientWidth

        if (changeX <= 0)
            this.setX(0)
        else if (changeX >= maxWidth)
            this.setX(maxWidth)
        else
            this.setX(changeX)
    }

    this.setX(gameWidth / 2)
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
            const leftSide = pairOfBarriers.leftSide.element
            const rightSide = pairOfBarriers.rightSide.element
            colided = areOverlaid(bird.element, leftSide)
                || areOverlaid(bird.element, rightSide)
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
    const width = gameArea.clientWidth
    const height = gameArea.clientHeight

    const progress = new Progress()
    const pairSet = new PairSet(width, height, 300, 600,
        () => progress.updatePoints(++points))
    const bird = new Bird(width)
    
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
