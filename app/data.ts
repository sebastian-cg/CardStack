type Deck = {
  id: string;
  name: string;
  description: string;
  cards: { front: string; back: string }[];
};

export const decks: Deck[] = [
  {
    id: "1",
    name: "Spanish Vocab",
    description: "Basic Spanish words",
    cards: [],
  },
  {
    id: "2",
    name: "Math Formulas",
    description: "Algebra formulas",
    cards: [],
  },
];

export const addDeck = (name: string, description: string) => {
  decks.push({
    id: `${decks.length + 1}`,
    name,
    description,
    cards: [],
  });
};

export const addCard = (deckId: string, front: string, back: string) => {
  const deck = decks.find((d) => d.id === deckId);
  if (deck) {
    deck.cards.push({ front, back });
  }
};

export const updateCard = (
  deckId: string,
  cardIndex: number,
  front: string,
  back: string
) => {
  const deck = decks.find((d) => d.id === deckId);
  if (deck && cardIndex >= 0 && cardIndex < deck.cards.length) {
    deck.cards[cardIndex] = { front, back };
  }
};
