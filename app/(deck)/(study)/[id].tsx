import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { decks } from "../../data";

export default function StudyScreen() {
  const router = useRouter();
  const { id, knownCards: knownCardsParam } = useLocalSearchParams();
  const deck = decks.find((d) => d.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Update per-deck and global streaks when the user starts studying
  useEffect(() => {
    const updateStreaks = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
          .toISOString()
          .split("T")[0];

        // Update per-deck streak
        const storedStreak = await AsyncStorage.getItem(`streak_${id}`);
        let streakData = storedStreak
          ? JSON.parse(storedStreak)
          : { lastActivityDate: "", streak: 0 };
        const lastActivity = streakData.lastActivityDate;

        if (lastActivity !== today) {
          if (lastActivity === yesterday) {
            streakData.streak += 1;
          } else if (
            !lastActivity ||
            new Date(lastActivity) < new Date(yesterday)
          ) {
            streakData.streak = 1;
          }
          streakData.lastActivityDate = today;
          await AsyncStorage.setItem(
            `streak_${id}`,
            JSON.stringify(streakData)
          );
        }

        // Update global streak
        const storedGlobalStreak = await AsyncStorage.getItem("globalStreak");
        let globalStreakData = storedGlobalStreak
          ? JSON.parse(storedGlobalStreak)
          : { lastActivityDate: "", streak: 0 };
        const lastGlobalActivity = globalStreakData.lastActivityDate;

        if (lastGlobalActivity !== today) {
          if (lastGlobalActivity === yesterday) {
            globalStreakData.streak += 1;
          } else if (
            !lastGlobalActivity ||
            new Date(lastGlobalActivity) < new Date(yesterday)
          ) {
            globalStreakData.streak = 1;
          }
          globalStreakData.lastActivityDate = today;
          await AsyncStorage.setItem(
            "globalStreak",
            JSON.stringify(globalStreakData)
          );
        }
      } catch (error) {
        console.error("Failed to update streaks:", error);
      }
    };

    updateStreaks();
  }, [id]);

  useEffect(() => {
    if (deck) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [deck]);

  if (!deck || deck.cards.length === 0) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-2xl font-bold text-black">No Cards to Study</Text>
        <Pressable
          className="bg-pink-500 p-3 rounded-lg mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Back to Deck</Text>
        </Pressable>
      </View>
    );
  }

  const studyCards = deck.cards.filter((_, index) => {
    const knownCards = knownCardsParam
      ? JSON.parse(knownCardsParam as string)
      : [];
    return !knownCards.includes(index);
  });
  if (studyCards.length === 0) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-2xl font-bold text-black">
          All Cards Marked as Known!
        </Text>
        <Pressable
          className="bg-pink-500 p-3 rounded-lg mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Back to Deck</Text>
        </Pressable>
      </View>
    );
  }

  const currentCard = studyCards[currentIndex];
  const progressPercentage = ((currentIndex + 1) / studyCards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-xl font-bold text-blue-500 mb-5">{deck.name}</Text>
      <View className="bg-gray-300 h-2 rounded-lg mb-4">
        <View
          className="bg-pink-500 h-2 rounded-lg"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
      <Text className="text-center text-lg text-gray-600 mb-2">
        {isFlipped ? "Answer" : "Question"}
      </Text>
      <Pressable
        className={`p-6 rounded-lg shadow items-center justify-center h-60 ${
          isFlipped ? "bg-green-100" : "bg-white"
        }`}
        onPress={handleFlip}
      >
        <Text className="text-2xl text-black">
          {isFlipped ? currentCard.back : currentCard.front}
        </Text>
      </Pressable>
      <View className="flex-row justify-between mt-4">
        <Pressable
          className="bg-red-500 p-3 rounded-lg"
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text className="text-white">Previous</Text>
        </Pressable>
        <Pressable className="bg-pink-500 p-3 rounded-lg" onPress={handleNext}>
          <Text className="text-white">
            {currentIndex === studyCards.length - 1 ? "Finish" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
