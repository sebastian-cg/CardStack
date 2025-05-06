import AsyncStorage from "@react-native-async-storage/async-storage";

type Deck = {
  id: string;
  name: string;
  description: string;
  cards: { front: string; back: string }[];
};

let decks: Deck[] = [];

const loadDecks = async () => {
  try {
    const storedDecks = await AsyncStorage.getItem("decks");
    if (storedDecks) {
      decks = JSON.parse(storedDecks);
    } else {
      decks = [
        {
          id: "1",
          name: "Spanish Vocab",
          description: "Basic Spanish words",
          cards: [
            { front: "Hola", back: "Hello" },
            { front: "Adiós", back: "Goodbye" },
            { front: "Gracias", back: "Thank you" },
          ],
        },
        {
          id: "2",
          name: "Math Formulas",
          description: "Algebra formulas",
          cards: [
            { front: "Quadratic Formula", back: "x = (-b ± √(b² - 4ac)) / 2a" },
            { front: "Pythagorean Theorem", back: "a² + b² = c²" },
          ],
        },
      ];
      await AsyncStorage.setItem("decks", JSON.stringify(decks));
    }
  } catch (error) {
    console.error("Failed to load decks:", error);
    decks = [
      {
        id: "1",
        name: "Spanish Vocab",
        description: "Basic Spanish words",
        cards: [
          { front: "Hola", back: "Hello" },
          { front: "Adiós", back: "Goodbye" },
          { front: "Gracias", back: "Thank you" },
        ],
      },
      {
        id: "2",
        name: "Math Formulas",
        description: "Algebra formulas",
        cards: [
          { front: "Quadratic Formula", back: "x = (-b ± √(b² - 4ac)) / 2a" },
          { front: "Pythagorean Theorem", back: "a² + b² = c²" },
        ],
      },
    ];
  }
};

const saveDecks = async () => {
  try {
    await AsyncStorage.setItem("decks", JSON.stringify(decks));
  } catch (error) {
    console.error("Failed to save decks:", error);
  }
};

loadDecks();

export { decks };

export const addDeck = async (name: string, description: string) => {
  decks.push({
    id: `${decks.length + 1}`,
    name,
    description,
    cards: [],
  });
  await saveDecks();
};

export const updateDeck = async (
  deckId: string,
  name: string,
  description: string
) => {
  const deck = decks.find((d) => d.id === deckId);
  if (deck) {
    deck.name = name;
    deck.description = description;
    await saveDecks();
  }
};

export const deleteDeck = async (deckId: string) => {
  const index = decks.findIndex((d) => d.id === deckId);
  if (index !== -1) {
    decks.splice(index, 1);
    await saveDecks();

    await AsyncStorage.removeItem(`knownCards_${deckId}`);
  }
};

export const addCard = async (deckId: string, front: string, back: string) => {
  const deck = decks.find((d) => d.id === deckId);
  if (deck) {
    deck.cards.push({ front, back });
    await saveDecks();
  }
};

export const updateCard = async (
  deckId: string,
  cardIndex: number,
  front: string,
  back: string
) => {
  const deck = decks.find((d) => d.id === deckId);
  if (deck && cardIndex >= 0 && cardIndex < deck.cards.length) {
    deck.cards[cardIndex] = { front, back };
    await saveDecks();
  }
};
