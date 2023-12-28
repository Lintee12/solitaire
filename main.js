"use strict";
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

let deck = [];

let foundationSlot1 = [];
let foundationSlot2 = [];
let foundationSlot3 = [];
let foundationSlot4 = [];

let reserveStock = [];
let reserveCurrent = [];

let tableau = {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []};

let moveCounter = 0;

const madeMove = () => { //function to update the movements the user has made
    moveCounter++;
    document.querySelector('.move-count').innerHTML = moveCounter;
}

function createCard(name, side) { //function to creaate a card element
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

function shuffleDeck() { //shuffle the deck
    deck = [];
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < values.length; j++) {
            const cardName = `${suits[i]}_${values[j]}`;
            deck.push(cardName);
        }
    }
    deck = shuffleArray(deck)
}

function dealDeck() { //deal cards to the proper place in the decks
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

function showFullDeck() { //dev function to show all the cards in the deck
    document.querySelector('.full-deck').innerHTML = '';
    deck.forEach(card => {
        let container = document.createElement('div');
        container.classList.add('foundation-slot');
        container.appendChild(createCard(card, 'front'));
        document.querySelector('.full-deck').appendChild(container);
    });
}

function addCardToTableau(element, tableauSlotIndex) { //adding a card to a tableau slot
    const tableauSlot = document.querySelector(`.tableau-slot-${tableauSlotIndex}`);
    if (tableauSlot.childElementCount > 0) {
        const topPosition = tableauSlot.lastElementChild.offsetTop + 20;
        element.style.top = `${topPosition}px`;
      }
    tableauSlot.appendChild(element);
}

function canStackOnCard(card, targetCard) { //see if cards can stack
    const cardValue = card.dataset.value;
    const targetCardValue = targetCard.dataset.value;

    //case for king stacking on empty slot
    if (cardValue === 'king' && targetCardValue === 'empty') {
        if(targetCard.children.length > 0) {
            return false;
        }
        else {
            return true;
        }
    }

    //make sure you cant stack on a card that has a card stacked on it
    const isLastChild = targetCard === targetCard.parentElement.lastElementChild;
    if(isLastChild === false) {
        return false;
    }

    //case queen on king
    if (cardValue === 'queen' && targetCardValue === 'king') {
        return card.dataset.color !== targetCard.dataset.color;
    }

    //stacking for all number cards
    const cardNumericValue = values.indexOf(cardValue);
    const targetCardNumericValue = values.indexOf(targetCardValue);

    //case for ace stacking on 2
    if (cardValue === 'ace' && targetCardValue === '2') {
        return card.dataset.color !== targetCard.dataset.color;
    }

    return (
        card.dataset.color !== targetCard.dataset.color &&
        cardNumericValue === targetCardNumericValue - 1
    );
}

function logBoard() {
    console.log('tableau:', tableau);
    console.log('reserveStock:', reserveStock);
    console.log('reserveCurrent:', reserveCurrent);
    console.log('foundation1:', foundationSlot1);
    console.log('foundation2:', foundationSlot2);
    console.log('foundation3:', foundationSlot3);
    console.log('foundation4:', foundationSlot4);
}

function findBoardLocation(card) { //find the array a card is located in
    const foundationSlots = [foundationSlot1, foundationSlot2, foundationSlot3, foundationSlot4];
    const reserveArrays = [reserveStock, reserveCurrent];

    if (foundationSlots.some(slot => slot.includes(card))) {
        return foundationSlots.find(slot => slot.includes(card));
    } else if (reserveArrays.some(array => array.includes(card))) {
        return reserveArrays.find(array => array.includes(card));
    } else {
        for (const key in tableau) {
            if (tableau[key].includes(card)) {
                return tableau[key];
            }
        }
    }

    return null; //didnt find card
}


function refreshCards() {
    console.log('refreshing cards...')
    for (let i = 1; i <= 7; i++) {
        const tableauSlot = document.querySelector(`.tableau-slot-${i}`);
        tableau[i - 1] = [...tableauSlot.children];

        const lastChild = tableauSlot.lastElementChild;
        if (lastChild) {
            lastChild.dataset.side = 'front';
        }
    }
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
            card.addEventListener('touchstart', handleDragStart, { passive: true });      
            card.addEventListener('mousedown', handleDragStart, false);            
        }
        const isChildOfFoundationSlot = Array.from(document.querySelectorAll('.foundation-slot')).some(slot => {
            return card.classList.contains('foundation-slot') && card.parentElement.closest(`.${slot.classList[1]}`) !== null;
        });

        if (!isChildOfFoundationSlot) {
            card.classList.remove('foundation-slot');
        } 
    });     
    foundationSlot1 = [...document.querySelector('.foundation-slot-1').children];
    foundationSlot2 = [...document.querySelector('.foundation-slot-2').children];
    foundationSlot3 = [...document.querySelector('.foundation-slot-3').children];
    foundationSlot4 = [...document.querySelector('.foundation-slot-4').children];
    document.querySelectorAll('.reserve-card').forEach(card => {
        card.addEventListener('click', reserveStockClickHandler);
        card.addEventListener('touchend', reserveStockClickHandler);
    });
}

function isValidFoundationMove(card, foundationSlot) {
    const cardValue = card.dataset.value;
    const cardSuit = card.dataset.suit;

    //check if card is the last in its slot 
    const parentChildren = card.parentElement.children;
    const isLastCard = card === parentChildren[parentChildren.length - 1];

    if (!isLastCard) {
        return false;
    }

    let slotCards;

    if (!foundationSlot.classList.contains('card')) {
        slotCards = foundationSlot.querySelectorAll('.card');
    } else {
        slotCards = foundationSlot.parentElement.querySelectorAll('.card');
    }

    if (slotCards.length === 0) {
        return cardValue === 'ace'; //can only place ace if its an empty foundation slot
    } else {
        const topCard = slotCards[slotCards.length - 1];
        const topCardValue = topCard.dataset.value;
        const topCardSuit = topCard.dataset.suit;

        return ( //place other cards
            cardSuit === topCardSuit &&
            values.indexOf(cardValue) === values.indexOf(topCardValue) + 1
        );
    }
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
let originalZIndex;

let payload = {
    card: undefined,
    stack: undefined, //all the cards in the payload
    initialTransform: undefined,
    initialBoardLocation: undefined,
}
//for card drag

function handleDragStart(event) {
    //event.preventDefault()
  if (elementUnderDrag === undefined) {
    if (event.type === 'touchstart') {
        console.log('mobile touch start')
      elementUnderDrag = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      elementUnderDrag = document.elementFromPoint(event.clientX, event.clientY);
    }
  }
  
  if ((event.button === 0 || event.type === 'touchstart') && event.target.parentNode.dataset.side === 'front') {
    payload.card = event.target.parentNode;
    originalZIndex = window.getComputedStyle(payload.card).zIndex;
    payload.initialBoardLocation = findBoardLocation(payload.card);

    //check if the cards are valid to drag and add them to the stack
    if (reserveCurrent.includes(payload.card)) {
      payload.stack = [payload.card];
    } else {
      const index = payload.initialBoardLocation.indexOf(payload.card);
      if (index !== -1) {
        payload.stack = payload.initialBoardLocation.slice(index);
      }
    }

    xOffset = 0;
    yOffset = 0;
    payload.initialTransform = payload.card.style.transform;
    if(event.type === 'touchstart') {
        initialX = event.touches[0].clientX - xOffset;
        initialY = event.touches[0].clientY - yOffset;
    }
    else {
        initialX = event.clientX - xOffset;
        initialY = event.clientY - yOffset;
    }
    isDragging = true;
    console.log(payload.initialBoardLocation);
    console.log('payload:', payload.stack);
  }
}

document.addEventListener('touchend', handleDrop, false);
document.addEventListener('mouseup', handleDrop, false);

function handleDrop(event) {
    event.preventDefault();
    if (payload.card) {

        payload.card.style.display = 'none';

        if(event.type === 'touchend') {
            var touch = event.touches[0] || event.changedTouches[0];
            elementUnderDrag = document.elementFromPoint(touch.pageX, touch.pageY); 
        }
        else {
            elementUnderDrag = document.elementFromPoint(event.clientX, event.clientY); 
        }

        payload.card.style.display = '';
        //find the element that we are trying to drop on
        if (elementUnderDrag.classList.contains('ignore-element')) {
            let parent = elementUnderDrag.parentElement;

            if (parent) {
                elementUnderDrag = parent;
            }
        }
        payload.card.style.zIndex = originalZIndex;

        if (elementUnderDrag && elementUnderDrag.classList.contains('foundation-slot')) {
            if(isValidFoundationMove(payload.card, elementUnderDrag)) {
                payload.card.style.top = '49px';
                payload.card.style.transform = null;
                payload.card.classList.add('foundation-slot');
                if(!elementUnderDrag.classList.contains('card')) {
                    elementUnderDrag.appendChild(payload.card);
                    madeMove();
                }
                else {
                    elementUnderDrag.parentElement.appendChild(payload.card);
                    madeMove();
                }

                for (let key in tableau) {
                    if (tableau.hasOwnProperty(key)) {
                        const col = tableau[key];
                        if (col.includes(payload.card)) {
                            col.splice(col.indexOf(payload.card), 1);
                            if (col.at(-1)) {
                                col.at(-1).dataset.side = 'front';
                            }
                        }
                    }
                }
                if (reserveCurrent.includes(payload.card)) {
                    reserveCurrent.pop();
                    payload.card.classList.remove('reserve-current-card');
                }
            }
            else {
                payload.card.style.transform = payload.initialTransform;
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
                } 
                else {
                    columnIndex = Object.values(tableau).findIndex(pile => pile.includes(elementUnderDrag));
                }

                if (columnIndex !== -1) {
                    const targetPile = document.querySelector(`.tableau-slot.tableau-slot-${columnIndex + 1}`);
                    const canStack = canStackOnCard(payload.card, elementUnderDrag);
                    console.log(payload.card)
                    if (canStack) { //if card can stack on the tableau
                        const currentColumnIndex = Object.values(tableau).findIndex(pile => pile.includes(payload.card));
                        if (reserveCurrent.includes(payload.card)) {
                            reserveCurrent.pop();
                            payload.card.classList.remove('reserve-current-card');
                        }
                        if (currentColumnIndex !== -1) {
                            if (reserveCurrent.includes(elementUnderDrag)) {
                                reserveCurrent.splice(reserveCurrent.indexOf(elementUnderDrag), 1);
                            }
                            if (reserveCurrent.includes(payload.card)) {
                                reserveCurrent.splice(reserveCurrent.indexOf(payload.card), 1); // Remove the card from reserveCurrent
                            }

                            tableau[currentColumnIndex].splice(tableau[currentColumnIndex].indexOf(payload.stack), 1);

                            const oldColumn = tableau[currentColumnIndex];
                            const newLastCardIndex = oldColumn.length - 1;
                            if (newLastCardIndex >= 0) {
                                oldColumn[newLastCardIndex].dataset.side = 'front';
                            }
                        }

                        if (targetPile.children.length === 0) {
                            if (payload.card.dataset.value === 'king') { // trying to place king on ampty slot
                                if(payload.card.classList.contains('reserve-current-card')) {
                                    targetPile.appendChild(payload.card);
                                    madeMove();
                                }
                                else {
                                    payload.stack.forEach(card => {
                                        card.style.top = "-1px";
                                        const lastChild = targetPile.children[targetPile.children.length - 1];
                                        const topValue = parseInt(lastChild ? lastChild.style.top || 0 : 0);
                                        //card.style.top = `${topValue + 20}px`; // FIX THIS FIRST NOW
                                        if(payload.stack.indexOf(card) != 0) {
                                            card.style.top = `${topValue + 20}px`;
                                        }
                                        targetPile.appendChild(card);
                                    });
                                    madeMove();
                                }
                                payload.card.style.transform = null;
                                payload.card.style.top = '-1px';

                                const targetColumnIndex = columnIndex;
                                tableau[targetColumnIndex].push(payload.card);

                                if (reserveCurrent.includes(payload.card)) {
                                    reserveCurrent.pop();
                                    payload.card.classList.remove('reserve-current-card');
                                }
                                refreshCards();
                            } 
                            else {
                                payload.card.style.transform = payload.initialTransform;
                                console.log('Only a King can be placed in an empty tableau slot.');
                            }
                        } 
                        else {
                            if(payload.card.classList.contains('reserve-current-card')) {
                                targetPile.appendChild(payload.card); //only place one card if its from the reserve
                                madeMove();
                            }
                            else {
                                payload.stack.forEach(card => {
                                    if (!reserveCurrent.includes(card)) {
                                        const lastChild = targetPile.children[targetPile.children.length - 1];
                                        const topValue = parseInt(lastChild ? lastChild.style.top || 0 : 0);
                                        card.style.top = `${topValue + 20}px`;
                                        targetPile.appendChild(card);;
                                    }
                                });     
                                madeMove();                                                        
                            }
                            payload.card.style.transform = null;
                            if (elementUnderDrag.style.top === '') {
                                payload.card.style.top = `${20}px`;
                            } 
                            else {
                                payload.card.style.top = `${parseInt(elementUnderDrag.style.top) + 20}px`;
                            }

                            const targetColumnIndex = parseInt(targetPile.classList[1].split('-')[2]) - 1;
                            tableau[targetColumnIndex].splice(tableau[targetColumnIndex].indexOf(elementUnderDrag) + 1, 0, payload.card);

                            if (reserveCurrent.includes(payload.card)) {
                                reserveCurrent.pop();
                                payload.card.classList.remove('reserve-current-card');
                            }
                            refreshCards();
                        }
                    } 
                    else {
                        payload.card.style.transform = payload.initialTransform;
                        console.log('Card cannot stack on this card.');
                    }
                } 
                else {
                    console.log(elementUnderDrag)
                    payload.card.style.transform = payload.initialTransform;
                    console.log('Column index not found.');
                }
            } 
            else {
                payload.card.style.transform = payload.initialTransform;
                console.log('Cannot stack on a back face card.');
            }
        } 
        else {
            console.log('Element does not exist or is not a card.');
            payload.card.style.transform = payload.initialTransform;
        }
        payload.initialBoardLocation = undefined;
        payload.stack = undefined;
        elementUnderDrag = undefined;
        payload.card = undefined;
        isDragging = false;
    }
}

document.addEventListener('touchmove', throttle(handleDrag, 8), false);
document.addEventListener('mousemove', throttle(handleDrag, 8), false);

function handleDrag(event) {
    //event.preventDefault();
    if (isDragging) {
      requestAnimationFrame(() => {
        if (payload.card) {
          let clientX, clientY;
          if (event.type === 'touchmove') {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
            console.log('mobile drag');
          } else {
            clientX = event.clientX;
            clientY = event.clientY;
          }
  
          xOffset = clientX - initialX;
          yOffset = clientY - initialY;
          console.log(xOffset)
  
          const roundedX = Math.round(xOffset);
          const roundedY = Math.round(yOffset);
  
          payload.card.style.transform = `translate(${roundedX}px, ${roundedY}px)`;
          
          payload.card.style.zIndex = '9999'; //place card on top of everything
        }
      });
    }
}

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
        refreshCards();
    }
}

function resetReserve(event) {
    madeMove(); 
    if (event.target === document.querySelector('.reserve-stock')) {
        if(reserveStock.length == 0) {
            Array.from(document.querySelectorAll('.reserve-current-card')).findLast(element => {
                element.classList.remove('reserve-current-card');
                element.classList.add('reserve-card');
                element.dataset.side = 'back';
                document.querySelector('.reserve-stock').appendChild(element);
                element.addEventListener('click', reserveStockClickHandler(event));
                element.addEventListener('touchend', reserveStockClickHandler(event));
                reserveStock.push(element);
                reserveCurrent.splice(element, 1);
                console.clear();
                refreshCards();
            });
        }
    }
}

window.onload = () => { //init the game
    shuffleDeck();
    showFullDeck();
    dealDeck();
    refreshCards();
    showFullDeck();
    document.querySelectorAll('.reserve-card').forEach(card => {
        card.addEventListener('click', reserveStockClickHandler);
        card.addEventListener('touchend', reserveStockClickHandler);
    });
    document.querySelector('.reserve-stock').addEventListener('click', resetReserve);
    document.querySelector('.reserve-stock').addEventListener('touchend', resetReserve);
}