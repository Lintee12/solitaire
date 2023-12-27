"use strict";
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

let deck = [];

let foundationSlot1 = [];
let foundationSlot2 = [];
let foundationSlot3 = [];
let foundationSlot4 = [];

let reserveStock = [];
let reserveCurrent = [];

let tableau = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []};

function createCard(name, side) {
    let div = document.createElement('div');
    let front = document.createElement('img');
    let back = document.createElement('img');
    let split = name.split("_");
    div.classList.add('card');
    if(name.includes('spades') || name.includes('clubs')) {
        div.classList.add('card-black');
        div.dataset.color = 'black';
    }
    else {
        div.classList.add('card-red');
        div.dataset.color = 'red';
    }
    div.dataset.card = name;
    div.dataset.side = side;
    div.dataset.suit = split[0];
    div.dataset.value = split[1];
    front.draggable = false;
    front.src = `svg_playing_cards/fronts/${name}.svg`;
    front.classList.add('ignore-element');
    back.draggable = false;
    back.src = 'svg_playing_cards/backs/red.svg';
    back.classList.add('ignore-element');
    if(side === 'front') {
        back.classList.add('hidden');
    }
    else {
        front.classList.add('hidden');
    }
    div.appendChild(front);
    div.appendChild(back);
    return div;
}

function shuffleArray(array) { //Fisher-Yates shuffle alogrithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function shuffleDeck() {
    deck = [];
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < values.length; j++) {
            const cardName = `${suits[i]}_${values[j]}`;
            deck.push(cardName);
        }
    }
    deck = shuffleArray(deck)
}

function addCardToTableau(element, tableauSlotIndex) {
    const tableauSlot = document.querySelector(`.tableau-slot-${tableauSlotIndex}`);
    if (tableauSlot.childElementCount > 0) {
        const topPosition = tableauSlot.lastElementChild.offsetTop + 20;
        element.style.top = `${topPosition}px`;
      }
    tableauSlot.appendChild(element);
}

function dealDeck() {
    let tableauCardCount = [1, 2, 3, 4, 5, 6, 7];
    let tableauTemp = [[], [], [], [], [], [], []];

    for (let count of tableauCardCount) {
        for (let i = 0; i < count; i++) {
            const cardType = (i === count - 1) ? 'front' : 'back';
            const card = createCard(deck.shift(), cardType);
            card.dataset.side = cardType;
            addCardToTableau(card, count);
            tableauTemp[count - 1].push(card);
        }
    }
    tableau = [...tableauTemp];

    deck.forEach(card => {
        const newCard = createCard(card, 'back');
        newCard.classList.add('reserve-card');
        reserveStock.push(newCard);
        document.querySelector('.reserve-stock').appendChild(newCard);
    });
    deck = [];
}

function showFullDeck() {
    document.querySelector('.full-deck').innerHTML = '';
    deck.forEach(card => {
        let container = document.createElement('div');
        container.classList.add('foundation-slot');
        container.appendChild(createCard(card, 'front'));
        document.querySelector('.full-deck').appendChild(container);
    });
}

function canStackOnCard(card, targetCard) {
    const cardValue = card.dataset.value;
    const targetCardValue = targetCard.dataset.value;

    // Special case for Ace stacking on King and vice versa
    if ((cardValue === 'ace' && targetCardValue === 'king') || (cardValue === 'king' && targetCardValue === 'ace')) {
        return card.dataset.color !== targetCard.dataset.color;
    }

    // Special case for Queen stacking on King and vice versa
    if ((cardValue === 'queen' && targetCardValue === 'king') || (cardValue === 'king' && targetCardValue === 'queen')) {
        return card.dataset.color !== targetCard.dataset.color;
    }

    // Normal stacking for other cards except Ace stacking on Two
    const cardNumericValue = values.indexOf(cardValue);
    const targetCardNumericValue = values.indexOf(targetCardValue);

    // Check if it's Ace stacking on the bottom of Two
    if (cardValue === 'ace' && targetCardValue === '2') {
        return card.dataset.color !== targetCard.dataset.color;
    }

    if (cardValue === 'king' && targetCardValue === 'empty') {
        return true;
    }

    return (
        card.dataset.color !== targetCard.dataset.color &&
        cardNumericValue === targetCardNumericValue - 1
    );
}

//for card drag
let currentDragCard;
let isDragging = false;
let initialCardTransform;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let elementUnderDrag;
let ogZindex;
//for card drag

function refreshCards() {
    document.querySelectorAll('.card').forEach(card => {
        if(card.dataset.side === 'front') {
            card.firstElementChild.classList.remove('hidden');
            card.lastElementChild.classList.add('hidden');
        }
        else {
            card.firstElementChild.classList.add('hidden');
            card.lastElementChild.classList.remove('hidden');
        }
        if(card.dataset.side === 'front') {
            card.addEventListener('mousedown', (event) => {
                event.preventDefault();
                if(elementUnderDrag == undefined) {
                    elementUnderDrag = document.elementFromPoint(event.clientX, event.clientY);
                }
                if (event.button === 0 && event.target.parentNode.dataset.side === 'front') {
                    console.log('down');
                    currentDragCard = event.target.parentNode;
                    xOffset = 0;
                    yOffset = 0;
                    initialCardTransform = currentDragCard.style.transform;
                    ogZindex = currentDragCard.style.zIndex;
                    //currentDragCard.style.zIndex = 9999;
                    initialX = event.clientX - xOffset;
                    initialY = event.clientY - yOffset;
                    isDragging = true;
                }
            });            
        }
        const isChildOfFoundationSlot = Array.from(document.querySelectorAll('.foundation-slot')).some(slot => {
            return card.classList.contains('foundation-slot') && card.parentElement.closest(`.${slot.classList[1]}`) !== null;
        });

        if (!isChildOfFoundationSlot) {
            card.classList.remove('foundation-slot');
        } 
    });
    //console.log('tableau:', tableau);
    //console.log('reserve:', reserveStock);
    document.querySelectorAll('.reserve-card').forEach(card => {
        card.addEventListener('click', reserveStockClickHandler);
    });
}

function isValidFoundationMove(card, foundationSlot) {
    const cardValue = card.dataset.value;
    const cardSuit = card.dataset.suit;

    let slotCards;

    if(!foundationSlot.classList.contains('card')) {
        slotCards = foundationSlot.querySelectorAll('.card');
    }
    else {
        slotCards = foundationSlot.parentElement.querySelectorAll('.card');
    }
    if (slotCards.length === 0) {
        return cardValue === 'ace'; // Only allow placing an Ace if the slot is empty
    } else {
        const topCard = slotCards[slotCards.length - 1];
        const topCardValue = topCard.dataset.value;
        const topCardSuit = topCard.dataset.suit;

        // Map card values to an index for comparison
        const values = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

        // Check if the card suit matches the top card suit and the card value is the next in sequence
        return (
            cardSuit === topCardSuit &&
            values.indexOf(cardValue) === values.indexOf(topCardValue) + 1
        );
    }
}

function getValueIndex(value) {
    const values = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
    return values.indexOf(value);
}

document.addEventListener('mouseup', handleMouseUp);

function handleMouseUp(event) {
    event.preventDefault();

    if (currentDragCard) {
        console.log('up');
        if (elementUnderDrag && elementUnderDrag.classList.contains('foundation-slot')) {
            if(isValidFoundationMove(currentDragCard, elementUnderDrag)) {
                currentDragCard.style.top = '10px';
                currentDragCard.style.transform = null;
                currentDragCard.classList.add('foundation-slot');
                if(!elementUnderDrag.classList.contains('card')) {
                    elementUnderDrag.appendChild(currentDragCard);
                }
                else {
                    elementUnderDrag.parentElement.appendChild(currentDragCard);
                }

                for (let key in tableau) {
                    if (tableau.hasOwnProperty(key)) {
                        const col = tableau[key];
                        if (col.includes(currentDragCard)) {
                            col.splice(col.indexOf(currentDragCard), 1);
                            if (col.at(-1)) {
                                col.at(-1).dataset.side = 'front';
                            }
                        }
                    }
                }
                if (reserveCurrent.includes(currentDragCard)) {
                    reserveCurrent.pop();
                    currentDragCard.classList.remove('reserve-current-card');
                }
            }
            else {
                currentDragCard.style.transform = initialCardTransform;
                console.log('Not a valid foundation move.');
            }
            refreshCards();
        } 
        else if (elementUnderDrag && elementUnderDrag.classList.contains('card') || elementUnderDrag && elementUnderDrag.classList.contains('tableau-slot')) {
            if (elementUnderDrag.dataset.side === 'front' || elementUnderDrag.classList.contains('tableau-slot')) {
                let columnIndex;

                if (elementUnderDrag.classList.contains('tableau-slot')) {
                    console.log(elementUnderDrag);
                    columnIndex = parseInt(elementUnderDrag.classList[1].split('-')[2]) - 1;
                } else {
                    columnIndex = Object.values(tableau).findIndex(pile => pile.includes(elementUnderDrag));
                }

                if (columnIndex !== -1) {
                    const targetPile = document.querySelector(`.tableau-slot.tableau-slot-${columnIndex + 1}`);
                    const canStack = canStackOnCard(currentDragCard, elementUnderDrag);

                    if (canStack /* && elementUnderDrag.dataset.side === 'front' */) {
                        const currentColumnIndex = Object.values(tableau).findIndex(pile => pile.includes(currentDragCard));

                        if (currentColumnIndex !== -1) {
                            if (reserveCurrent.includes(elementUnderDrag)) {
                                reserveCurrent.splice(reserveCurrent.indexOf(elementUnderDrag), 1);
                            }

                            tableau[currentColumnIndex].splice(tableau[currentColumnIndex].indexOf(currentDragCard), 1);

                            const oldColumn = tableau[currentColumnIndex];
                            const newLastCardIndex = oldColumn.length - 1;
                            if (newLastCardIndex >= 0) {
                                oldColumn[newLastCardIndex].dataset.side = 'front';
                            }
                        }

                        if (targetPile.children.length === 0) {
                            if (currentDragCard.dataset.value === 'king') {
                                targetPile.appendChild(currentDragCard);
                                currentDragCard.style.transform = null;
                                currentDragCard.style.top = '-1px';

                                const targetColumnIndex = columnIndex;
                                tableau[targetColumnIndex].push(currentDragCard);

                                if (reserveCurrent.includes(currentDragCard)) {
                                    reserveCurrent.pop();
                                    currentDragCard.classList.remove('reserve-current-card');
                                }
                                refreshCards();
                            } 
                            else {
                                currentDragCard.style.transform = initialCardTransform;
                                console.log('Only a King can be placed in an empty tableau slot.');
                            }
                        } 
                        else {
                            targetPile.appendChild(currentDragCard);
                            currentDragCard.style.transform = null;
                            if (elementUnderDrag.style.top === '') {
                                currentDragCard.style.top = `${20}px`;
                            } 
                            else {
                                currentDragCard.style.top = `${parseInt(elementUnderDrag.style.top) + 20}px`;
                            }

                            const targetColumnIndex = parseInt(targetPile.classList[1].split('-')[2]) - 1;
                            tableau[targetColumnIndex].splice(tableau[targetColumnIndex].indexOf(elementUnderDrag) + 1, 0, currentDragCard);

                            if (reserveCurrent.includes(currentDragCard)) {
                                reserveCurrent.pop();
                                currentDragCard.classList.remove('reserve-current-card');
                            }
                            refreshCards();
                        }
                    } 
                    else {
                        currentDragCard.style.transform = initialCardTransform;
                        console.log('Card cannot stack on this card.');
                    }
                } 
                else {
                    console.log(elementUnderDrag)
                    currentDragCard.style.transform = initialCardTransform;
                    console.log('Column index not found.');
                }
            } 
            else {
                currentDragCard.style.transform = initialCardTransform;
                console.log('Cannot stack on a back face card.');
            }
        } 
        else {
            console.log('Element does not exist or is not a card.');
            currentDragCard.style.transform = initialCardTransform;
        }

        elementUnderDrag = undefined;
        currentDragCard = undefined;
        isDragging = false;
    }
}

document.addEventListener('mousemove', throttle((event) => {
    if (currentDragCard !== undefined && isDragging) {
        xOffset = event.clientX - initialX;
        yOffset = event.clientY - initialY;

        const roundedX = Math.round(xOffset);
        const roundedY = Math.round(yOffset);

        currentDragCard.style.transform = `translate(${roundedX}px, ${roundedY}px)`;

        currentDragCard.style.display = 'none';

        elementUnderDrag = document.elementFromPoint(event.clientX, event.clientY);

        currentDragCard.style.display = '';

        if (elementUnderDrag.classList.contains('ignore-element')) {
            let parent = elementUnderDrag.parentElement;

            if (parent) {
                elementUnderDrag = parent;
            }
            //console.log(elementUnderDrag);
        }

        if (elementUnderDrag.classList.contains('tableau-slot')) {
            if (elementUnderDrag.childElementCount === 0) {
                //console.log(elementUnderDrag)
                //console.log('Empty tableau slot');
            } else {
                // This tableau slot is not empty
                //console.log('Not an empty tableau slot');
            }
        }
    }
}, 24));

function reserveStockClickHandler(event) {
    const card = event.currentTarget;
    if(card.classList.contains('card')) {
        card.classList.remove('reserve-card');
        card.classList.add('reserve-current-card')
        card.dataset.side = 'front';
        document.querySelector('.reserve-current').appendChild(card);
        reserveCurrent.push(card);
        reserveStock.splice(card, 1);
        card.removeEventListener('click', reserveStockClickHandler);
        console.clear();
        console.log('tableau:', tableau);
        console.log('reserve:', reserveStock);
        console.log('current:', reserveCurrent);
        refreshCards();
    }
}

window.onload = () => {
    shuffleDeck();
    showFullDeck();
    dealDeck();
    refreshCards();
    console.log('tableau:', tableau);
    console.log('reserve:', reserveStock);
    showFullDeck();
    document.querySelectorAll('.reserve-card').forEach(card => {
        card.addEventListener('click', reserveStockClickHandler);
    });
    document.querySelector('.reserve-stock').addEventListener('click', (event) => {
        if (event.target === document.querySelector('.reserve-stock')) {
            if(reserveStock.length == 0) {
                Array.from(document.querySelectorAll('.reserve-current-card')).findLast(element => {
                    element.classList.remove('reserve-current-card');
                    element.classList.add('reserve-card');
                    element.dataset.side = 'back';
                    document.querySelector('.reserve-stock').appendChild(element);
                    element.addEventListener('click', reserveStockClickHandler(event));
                    reserveStock.push(element);
                    reserveCurrent.splice(element, 1);
                    console.clear();
                    console.log('tableau:', tableau);
                    console.log('reserve:', reserveStock);
                    console.log('current:', reserveCurrent);
                    refreshCards();
                });
            }
        }
    });
}