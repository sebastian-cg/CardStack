import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { decks } from "../data";

export default function DeckDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const deck = decks.find((d) => d.id === id);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );
  const [confirmEditIndex, setConfirmEditIndex] = useState<number | null>(null);
  const [confirmUnknownIndex, setConfirmUnknownIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    const loadKnownCards = async () => {
      try {
        const stored = await AsyncStorage.getItem(`knownCards_${id}`);
        if (stored) {
          setKnownCards(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load known cards:", error);
      }
    };
    loadKnownCards();
  }, [id]);

  useEffect(() => {
    const saveKnownCards = async () => {
      try {
        await AsyncStorage.setItem(
          `knownCards_${id}`,
          JSON.stringify(knownCards)
        );
      } catch (error) {
        console.error("Failed to save known cards:", error);
      }
    };
    saveKnownCards();
  }, [knownCards, id]);

  if (!deck) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-2xl font-bold text-black">Deck Not Found</Text>
      </View>
    );
  }

  const saveDecks = async () => {
    try {
      await AsyncStorage.setItem("decks", JSON.stringify(decks));
    } catch (error) {
      console.error("Failed to save decks:", error);
    }
  };

  const handleDeleteConfirm = async (index: number) => {
    deck.cards.splice(index, 1);
    setKnownCards(knownCards.filter((i) => i !== index));
    setConfirmDeleteIndex(null);
    await saveDecks();
    router.setParams({ refresh: Date.now().toString() });
  };

  const handleEditConfirm = (index: number) => {
    router.push({
      pathname: "/(create)/(edit)/[deckId]",
      params: { deckId: id, cardIndex: index },
    });
    setConfirmEditIndex(null);
  };

  const handleMarkAsUnknown = (index: number) => {
    setKnownCards(knownCards.filter((i) => i !== index));
    setConfirmUnknownIndex(null);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold text-blue-500 mb-2">
          {deck.name}
        </Text>
        <Text className="text-gray-500 mb-5">{deck.description}</Text>
        <View className="flex-row justify-between">
          <Pressable
            className="bg-pink-500 p-3 rounded-lg mb-4 flex-1 mr-2"
            onPress={() =>
              router.push({
                pathname: "/(deck)/(study)/[id]",
                params: { id, knownCards: JSON.stringify(knownCards) },
              })
            }
          >
            <Text className="text-white text-center font-bold">
              Start Studying
            </Text>
          </Pressable>
          <Pressable
            className="bg-green-500 p-3 rounded-lg mb-4 flex-1"
            onPress={() => router.push(`/(deck)/(quiz)/${id}`)}
          >
            <Text className="text-white text-center font-bold">Take Quiz</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={deck.cards}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item, index }) => (
          <View className="bg-white m-4 p-4 rounded-lg shadow">
            <Text className="text-lg font-bold text-black">
              Question: {item.front}
            </Text>
            <Text className="text-gray-500 mb-2">Answer: {item.back}</Text>
            <View className="flex-row justify-between">
              <Pressable
                className="bg-blue-500 p-2 rounded-lg mr-2"
                onPress={() => setConfirmEditIndex(index)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </Pressable>
              <Pressable
                className="bg-red-500 p-2 rounded-lg mr-2"
                onPress={() => setConfirmDeleteIndex(index)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </Pressable>
              {knownCards.includes(index) && (
                <Pressable
                  className="bg-green-500 p-2 rounded-lg"
                  onPress={() => setConfirmUnknownIndex(index)}
                >
                  <Ionicons name="checkmark-outline" size={20} color="white" />
                </Pressable>
              )}
            </View>
            {confirmEditIndex === index && (
              <View className="bg-gray-100 p-4 rounded-lg mt-2">
                <Text className="text-black mb-2">Edit this card?</Text>
                <View className="flex-row justify-between">
                  <Pressable
                    className="bg-pink-500 p-2 rounded-lg"
                    onPress={() => handleEditConfirm(index)}
                  >
                    <Text className="text-white">Yes</Text>
                  </Pressable>
                  <Pressable
                    className="bg-gray-300 p-2 rounded-lg"
                    onPress={() => setConfirmEditIndex(null)}
                  >
                    <Text className="text-black">No</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {confirmDeleteIndex === index && (
              <View className="bg-gray-100 p-4 rounded-lg mt-2">
                <Text className="text-black mb-2">Delete this card?</Text>
                <View className="flex-row justify-between">
                  <Pressable
                    className="bg-pink-500 p-2 rounded-lg"
                    onPress={() => handleDeleteConfirm(index)}
                  >
                    <Text className="text-white">Yes</Text>
                  </Pressable>
                  <Pressable
                    className="bg-gray-300 p-2 rounded-lg"
                    onPress={() => setConfirmDeleteIndex(null)}
                  >
                    <Text className="text-black">No</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {confirmUnknownIndex === index && (
              <View className="bg-gray-100 p-4 rounded-lg mt-2">
                <Text className="text-black mb-2">Mark as unknown?</Text>
                <View className="flex-row justify-between">
                  <Pressable
                    className="bg-pink-500 p-2 rounded-lg"
                    onPress={() => handleMarkAsUnknown(index)}
                  >
                    <Text className="text-white">Yes</Text>
                  </Pressable>
                  <Pressable
                    className="bg-gray-300 p-2 rounded-lg"
                    onPress={() => setConfirmUnknownIndex(null)}
                  >
                    <Text className="text-black">No</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No cards yet. Add one!
          </Text>
        }
      />
      <Pressable
        className="bg-pink-500 rounded-full w-14 h-14 items-center justify-center absolute bottom-6 right-6 shadow-lg"
        onPress={() =>
          router.push({
            pathname: "/(create)/(edit)/[deckId]",
            params: { deckId: id },
          })
        }
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>
    </View>
  );
}
