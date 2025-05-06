import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { decks, deleteDeck } from "../data";

export default function HomeScreen() {
  const router = useRouter();
  const [deckList, setDeckList] = useState(decks);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEditId, setConfirmEditId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadDecks = async () => {
        try {
          const storedDecks = await AsyncStorage.getItem("decks");
          if (storedDecks) {
            const parsedDecks = JSON.parse(storedDecks);
            setDeckList(parsedDecks);

            decks.length = 0;
            parsedDecks.forEach((deck: any) => decks.push(deck));
          }
        } catch (error) {
          console.error("Failed to load decks:", error);
        }
      };
      loadDecks();
    }, [])
  );

  const handleDeleteConfirm = async (deckId: string) => {
    await deleteDeck(deckId);
    setConfirmDeleteId(null);
    setDeckList([...decks]);
  };

  const handleEditConfirm = (deckId: string) => {
    router.push({ pathname: "/(create)/edit-deck", params: { id: deckId } });
    setConfirmEditId(null);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={deckList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white m-4 p-4 rounded-lg shadow">
            <Pressable
              className="flex-1"
              onPress={() => router.push(`/(deck)/${item.id}`)}
            >
              <Text className="text-lg font-bold text-pink-500">
                {item.name}
              </Text>
              <Text className="text-gray-500">{item.description}</Text>
            </Pressable>
            <View className="flex-row justify-end mt-2">
              <Pressable
                className="bg-blue-500 p-2 rounded-lg mr-2"
                onPress={() => setConfirmEditId(item.id)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </Pressable>
              <Pressable
                className="bg-red-500 p-2 rounded-lg"
                onPress={() => setConfirmDeleteId(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </Pressable>
            </View>
            {confirmEditId === item.id && (
              <View className="bg-gray-100 p-4 rounded-lg mt-2">
                <Text className="text-black mb-2">Edit this deck?</Text>
                <View className="flex-row justify-between">
                  <Pressable
                    className="bg-pink-500 p-2 rounded-lg"
                    onPress={() => handleEditConfirm(item.id)}
                  >
                    <Text className="text-white">Yes</Text>
                  </Pressable>
                  <Pressable
                    className="bg-gray-300 p-2 rounded-lg"
                    onPress={() => setConfirmEditId(null)}
                  >
                    <Text className="text-black">No</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {confirmDeleteId === item.id && (
              <View className="bg-gray-100 p-4 rounded-lg mt-2">
                <Text className="text-black mb-2">Delete this deck?</Text>
                <View className="flex-row justify-between">
                  <Pressable
                    className="bg-pink-500 p-2 rounded-lg"
                    onPress={() => handleDeleteConfirm(item.id)}
                  >
                    <Text className="text-white">Yes</Text>
                  </Pressable>
                  <Pressable
                    className="bg-gray-300 p-2 rounded-lg"
                    onPress={() => setConfirmDeleteId(null)}
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
