const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}
//  ^^^^ Right here I am storing the references to some of the elements in my HTML so that I can update them
// Coded by DonQuaya

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}
// ^^^^ Right here I am keeping track of the current game status. I am tracking how many cards are flips, how many attempts is taken and how much time is taken.
// Coded by DonQuaya


const shuffle = array => {
    const clonedArray = [...array]

    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const original = clonedArray[i]

        clonedArray[i] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}

// ^^^^ Right here I created an arrow function that randomly shuffles the array, this to make sure the card positions change every game. 
// Coded by DonQuaya


const pickRandom = (array, items) => {
    const clonedArray = [...array]
    const randomPicks = []

    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length)
        
        randomPicks.push(clonedArray[randomIndex])
        clonedArray.splice(randomIndex, 1)
    }

    return randomPicks
}
//^^^^ Right here I created a arrow function that randomly picks a number of items from the array. This is what I used to select the logos
// Coded by Donquaya

const getCardValue = (card) => {
    const img = card.querySelector('.card-back img')
    return img ? img.src : card.querySelector('.card-back').textContent.trim()
}
// ^^^^ Right here I created a function to get the actual value of the card by checking the image sources, this way the game can tell whether the two cards selected are a match 
// Coded by DonQuaya
const generateGame = () => {
    const dimensions = selectors.board.getAttribute('data-dimension')  

    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.")
    }

    const teams = ['https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Oklahoma_City_Thunder.svg/1200px-Oklahoma_City_Thunder.svg.png','https://upload.wikimedia.org/wikipedia/en/thumb/e/ed/Los_Angeles_Clippers_%282024%29.svg/1200px-Los_Angeles_Clippers_%282024%29.svg.png','https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png','https://cdn.freebiesupply.com/images/large/2x/golden-state-warriors-logo-transparent.png','https://cdn.freebiesupply.com/images/large/2x/boston-celtics-logo-transparent.png','https://1000logos.net/wp-content/uploads/2018/03/Milwaukee-Bucks-Logo.png','https://cdn.freebiesupply.com/images/large/2x/new-york-knicks-logo-transparent.png','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cleveland_Cavaliers_logo.svg/1189px-Cleveland_Cavaliers_logo.svg.png']
    const picks = pickRandom(teams, (dimensions * dimensions) / 2) 
    const items = shuffle([...picks, ...picks])
    
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
    <div class="card">
        <div class="card-front"></div>
        <div class="card-back">
            ${item.startsWith('http') ? `<img src="${item}" alt="card image" style="width: 70px; height: 70px; object-fit: contain; display: block; margin: 0 auto; margin-top: 15px;" />
` : item}
        </div>
    </div>
`).join('')}
       </div>
    `
    
    const parser = new DOMParser().parseFromString(cards, 'text/html')

    selectors.board.replaceWith(parser.querySelector('.board'))
}

// ^^^^ Right here I created the function that actually builds the game.  Checks the Board size being that it has to be a even Number. It picks the logos, double and shuffle to cards to that the game is set up correctly.
// Coded by DonQuaya


const startGame = () => {
    state.gameStarted = true
    selectors.start.classList.add('disabled')

    state.loop = setInterval(() => {
        state.totalTime++

        selectors.moves.innerText = `${state.totalFlips} moves`
        selectors.timer.innerText = `Time: ${state.totalTime} sec`
    }, 1000)
}
// ^^^^ Right here I created a function that starts the timer so that the game is marked as started.  It also updated the move counter and the timer every second.
// Coded by DonQuaya


const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}
// ^^^^ Right here I created a function that flips over an unmatched card after about a second if the player selects two cards that do not match.
// Coded by DonQuaya

const flipCard = card => {
    state.flippedCards++
    state.totalFlips++

    if (!state.gameStarted) {
        startGame()
    }

    if (state.flippedCards <= 2) {
        card.classList.add('flipped')
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)')

        if (getCardValue(flippedCards[0]) === getCardValue(flippedCards[1])) {
            flippedCards[0].classList.add('matched')
            flippedCards[1].classList.add('matched')
        }
        

        setTimeout(() => {
            flipBackCards()
        }, 1000)
    }
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `

            clearInterval(state.loop)
        }, 1000)
    }
}
// ^^^^ Right here I created a function that handles the flipping logic meaning it starts the game timer on first flip, increases the move counter and marks successful matches as well as notifies when all matches are found.
// Coded by DonQuaya
const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
            flipCard(eventParent)
        } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
            startGame()
        }
    })
}

// ^^^^ Right here I created a function that listens for clicks on the cards and the start button. Basically if a card is click it calls the flipCard and if the start button is clicked, it starts the game.
// Coded by DonQuaya


generateGame()
attachEventListeners()

// ^^^^ Right here I am calling the game. This this runs the game by building it and enabling the click handlers.
// Coded by Quaya