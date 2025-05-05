import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { decks } from "../data";

export default function DeckDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const deck = decks.find((d) => d.id === id);

  if (!deck) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-2xl font-bold text-black">Deck Not Found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold text-black">{deck.name}</Text>
        <Text className="text-gray-500 mb-4">{deck.description}</Text>
        <Pressable
          className="bg-pink-500 p-3 rounded-lg mb-4"
          onPress={() => router.push(`./(deck)/(study)/${id}`)}
        >
          <Text className="text-white text-center font-bold">
            Start Studying
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={deck.cards}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item, index }) => (
          <View className="bg-white m-4 p-4 rounded-lg shadow">
            <Text className="text-lg font-bold text-black">
              Front: {item.front}
            </Text>
            <Text className="text-gray-500 mb-2">Back: {item.back}</Text>
            <View className="flex-row justify-between">
              <Pressable
                className="bg-blue-500 p-2 rounded-lg"
                onPress={() =>
                  router.push({
                    pathname: "/(create)/(edit)/[deckId]",
                    params: { deckId: id, cardIndex: index },
                  })
                }
              >
                <Text className="text-white">Edit</Text>
              </Pressable>
              <Pressable
                className="bg-red-500 p-2 rounded-lg"
                onPress={() => {
                  deck.cards.splice(index, 1);
                  router.setParams({ refresh: Date.now().toString() });
                }}
              >
                <Text className="text-white">Delete</Text>
              </Pressable>
            </View>
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
