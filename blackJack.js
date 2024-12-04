const apiUrl = "https://deckofcardsapi.com/api/deck";
let deckId;
let dealerScore = 0;
let playerScore = 0;
let dealerCards = [];

async function initializeGame() {
    const response = await fetch(`${apiUrl}/new/shuffle/?deck_count=6`);
    const data = await response.json();
    deckId = data.deck_id;
    startGame();
}

async function drawCard() {
    const response = await fetch(`${apiUrl}/${deckId}/draw/?count=1`);
    const data = await response.json();
    return data.cards[0];
}

function calculateScore(card) {
    if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
        return 10;
    } else if (card.value === 'ACE') {
        return 11;
    } else {
        return parseInt(card.value);
    }
}

function adjustForAces(cards) {
    let score = cards.reduce((total, card) => total + calculateScore(card), 0);
    let aceCount = cards.filter(card => card.value === 'ACE').length;
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function checkAutomaticWin(cards) {
    const hasAce = cards.some(card => card.value === 'ACE');
    const hasFaceCard = cards.some(card => ['KING', 'QUEEN', 'JACK'].includes(card.value));
    return hasAce && hasFaceCard;
}

async function startGame() {
    dealerCards = [await drawCard(), await drawCard()];
    const playerCards = [await drawCard(), await drawCard()];
    dealerScore = adjustForAces(dealerCards);
    playerScore = adjustForAces(playerCards);
    document.getElementById('dealer-cards').innerHTML = `
        <img src="${dealerCards[0].image}" alt="${dealerCards[0].value} of ${dealerCards[0].suit}" class="draw-card">
        <img src="cartaBocabajo.jpg" alt="Face Down Card" class="draw-card">
    `;
    document.getElementById('player-cards').innerHTML = `
        <img src="${playerCards[0].image}" alt="${playerCards[0].value} of ${playerCards[0].suit}" class="draw-card">
        <img src="${playerCards[1].image}" alt="${playerCards[1].value} of ${playerCards[1].suit}" class="draw-card">
    `;
    document.getElementById('dealer-score').innerText = `Score: ${dealerScore}`;
    document.getElementById('player-score').innerText = `Score: ${playerScore}`;

    if (checkAutomaticWin(playerCards)) {
        displayMessage('Player wins with a Blackjack!');
    }
}

document.getElementById('hit-button').addEventListener('click', async () => {
    const playerCard = await drawCard();
    const playerCards = [...document.querySelectorAll('#player-cards img')].map(img => ({ value: img.alt.split(' ')[0] }));
    playerCards.push(playerCard);
    playerScore = adjustForAces(playerCards);
    const playerCardElement = document.createElement('img');
    playerCardElement.src = playerCard.image;
    playerCardElement.alt = `${playerCard.value} of ${playerCard.suit}`;
    playerCardElement.classList.add('draw-card');
    document.getElementById('player-cards').appendChild(playerCardElement);
    document.getElementById('player-score').innerText = `Score: ${playerScore}`;
    if (playerScore > 21) {
        displayMessage('Player busts! Dealer wins.');
    }
});

document.getElementById('stand-button').addEventListener('click', async () => {
    dealerScore += calculateScore(dealerCards[1]);
    document.getElementById('dealer-cards').innerHTML = `
        <img src="${dealerCards[0].image}" alt="${dealerCards[0].value} of ${dealerCards[0].suit}" class="draw-card">
        <img src="${dealerCards[1].image}" alt="${dealerCards[1].value} of ${dealerCards[1].suit}" class="draw-card">
    `;
    document.getElementById('dealer-score').innerText = `Score: ${dealerScore}`;

    while (dealerScore <= 16) {
        const dealerCard = await drawCard();
        dealerCards.push(dealerCard);
        dealerScore = adjustForAces(dealerCards);
        const dealerCardElement = document.createElement('img');
        dealerCardElement.src = dealerCard.image;
        dealerCardElement.alt = `${dealerCard.value} of ${dealerCard.suit}`;
        dealerCardElement.classList.add('draw-card');
        document.getElementById('dealer-cards').appendChild(dealerCardElement);
        document.getElementById('dealer-score').innerText = `Score: ${dealerScore}`;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay to show the dealer drawing cards
    }
    if (dealerScore > 21 || playerScore > dealerScore) {
        displayMessage('Player wins!');
    } else if (playerScore === dealerScore) {
        displayMessage("It's a tie!");
    } else {
        displayMessage('Dealer wins!');
    }
});

function displayMessage(message) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    document.getElementById('next-round-button').style.display = 'block';
    document.getElementById('hit-button').style.display = 'none';
    document.getElementById('stand-button').style.display = 'none';
    document.getElementById('restart-button').style.display = 'none';
}

function hideMessage() {
    const messageElement = document.getElementById('game-message');
    messageElement.style.display = 'none';
    document.getElementById('next-round-button').style.display = 'none';
    document.getElementById('hit-button').style.display = 'inline-block';
    document.getElementById('stand-button').style.display = 'inline-block';
    document.getElementById('restart-button').style.display = 'inline-block';
}

function endGame() {
    resetScores();
}

function resetScores() {
    dealerScore = 0;
    playerScore = 0;
    document.getElementById('dealer-score').textContent = 'Score: 0';
    document.getElementById('player-score').textContent = 'Score: 0';
}

document.getElementById('restart-button').addEventListener('click', () => {
    hideMessage();
    endGame();
    initializeGame();
});

document.getElementById('next-round-button').addEventListener('click', () => {
    hideMessage();
    endGame();
    initializeGame();
});

initializeGame();