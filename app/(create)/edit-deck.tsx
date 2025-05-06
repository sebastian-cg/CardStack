import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { decks, updateDeck } from "../data";

export default function EditDeckScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const deck = decks.find((d) => d.id === id);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description);
    }
  }, [deck]);

  const handleSave = async () => {
    if (name.trim() && description.trim()) {
      await updateDeck(id as string, name, description);
      router.back();
    }
  };

  if (!deck) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-2xl font-bold text-black">Deck Not Found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-blue-500 mb-4">Edit Deck</Text>
      <TextInput
        className="bg-white p-3 rounded-lg mb-4 text-black"
        placeholder="Deck Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="bg-white p-3 rounded-lg mb-4 text-black"
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Pressable
        className="bg-pink-500 p-3 rounded-lg mb-2"
        onPress={handleSave}
        disabled={!name.trim() || !description.trim()}
      >
        <Text className="text-white text-center font-bold">Save Changes</Text>
      </Pressable>
      <Pressable className="p-3" onPress={() => router.back()}>
        <Text className="text-pink-500 text-center">Cancel</Text>
      </Pressable>
    </View>
  );
}
