import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { decks } from "../data";

export default function SettingsScreen() {
  const [isResetting, setIsResetting] = useState(false);

  const resetAllData = async () => {
    setIsResetting(true);
    try {
      // Clear all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);

      // Reset decks to defaults
      const defaultDecks = [
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
      decks.length = 0;
      defaultDecks.forEach((deck) => decks.push(deck));
      await AsyncStorage.setItem("decks", JSON.stringify(decks));

      await AsyncStorage.setItem(
        "globalStreak",
        JSON.stringify({ lastActivityDate: "", streak: 0 })
      );

      Alert.alert("Success", "All data has been reset to default.");
    } catch (error) {
      console.error("Failed to reset data:", error);
      Alert.alert("Error", "Failed to reset data. Please try again.");
    }
    setIsResetting(false);
  };

  const confirmReset = () => {
    Alert.alert(
      "Confirm Reset",
      "This will reset all decks, cards, known cards, quiz stats, and streaks to default. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: resetAllData, style: "destructive" },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="bg-white p-4 rounded-lg shadow mb-4">
        <Text className="text-lg font-bold text-black mb-2">
          App Information
        </Text>
        <Text className="text-gray-700">
          Developed by: Allan Cuadro Gonzales
        </Text>
        <Text className="text-gray-700">Version: 1.0.0</Text>
      </View>
      <View className="bg-white p-4 rounded-lg shadow">
        <Text className="text-lg font-bold text-black mb-2">Reset Options</Text>
        <Pressable
          className="bg-red-500 p-3 rounded-lg mb-2"
          onPress={confirmReset}
          disabled={isResetting}
        >
          <Text className="text-white text-center font-bold">
            {isResetting ? "Resetting..." : "Reset All Data"}
          </Text>
        </Pressable>
        <Text className="text-gray-500 text-sm">
          Resets decks, cards, known cards, quiz stats, and streaks to default.
        </Text>
      </View>
    </View>
  );
}
