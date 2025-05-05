import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { addCard, decks, updateCard } from "../../data";

export default function EditCardScreen() {
  const router = useRouter();
  const { deckId, cardIndex } = useLocalSearchParams();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const isEdit = cardIndex !== undefined && cardIndex !== null;
  const index = isEdit ? parseInt(cardIndex as string, 10) : -1;
  const deck = decks.find((d) => d.id === deckId);

  useEffect(() => {
    if (isEdit && deck && index >= 0 && index < deck.cards.length) {
      const card = deck.cards[index];
      setFront(card.front);
      setBack(card.back);
    }
  }, [isEdit, deck, index]);

  const handleSave = () => {
    if (front.trim() && back.trim() && deck) {
      if (isEdit && index >= 0 && index < deck.cards.length) {
        updateCard(deckId as string, index, front, back);
      } else {
        addCard(deckId as string, front, back);
      }
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-black mb-4">
        {isEdit ? "Edit Card" : "Add New Card"}
      </Text>
      <TextInput
        className="bg-white p-3 rounded-lg mb-4 text-black"
        placeholder="Front"
        value={front}
        onChangeText={setFront}
      />
      <TextInput
        className="bg-white p-3 rounded-lg mb-4 text-black"
        placeholder="Back"
        value={back}
        onChangeText={setBack}
        multiline
      />
      <Pressable
        className="bg-pink-500 p-3 rounded-lg mb-2"
        onPress={handleSave}
        disabled={!front.trim() || !back.trim()}
      >
        <Text className="text-white text-center font-bold">Save Card</Text>
      </Pressable>
      <Pressable className="p-3" onPress={() => router.back()}>
        <Text className="text-pink-500 text-center">Cancel</Text>
      </Pressable>
    </View>
  );
}
