import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { addDeck } from "../data";

export default function CreateDeckScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (name.trim() && description.trim()) {
      await addDeck(name, description);
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-black mb-4">Create Deck</Text>
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
        onPress={handleCreate}
        disabled={!name.trim() || !description.trim()}
      >
        <Text className="text-white text-center font-bold">Create Deck</Text>
      </Pressable>
      <Pressable className="p-3" onPress={() => router.back()}>
        <Text className="text-pink-500 text-center">Cancel</Text>
      </Pressable>
    </View>
  );
}
