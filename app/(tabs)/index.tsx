import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { decks } from "../data";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="bg-white m-4 p-4 rounded-lg shadow"
            onPress={() =>
              router.push({ pathname: "/(deck)/[id]", params: { id: item.id } })
            }
          >
            <Text className="text-lg font-bold text-black">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.description}</Text>
            <Text className="text-sm text-gray-400 mt-2">
              Cards: {item.cards.length}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No decks yet. Create one!
          </Text>
        }
      />
      <Pressable
        className="bg-pink-500 rounded-full w-14 h-14 items-center justify-center absolute bottom-6 right-6 shadow-lg"
        onPress={() => router.push("/(create)/create-deck")}
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>
    </View>
  );
}
