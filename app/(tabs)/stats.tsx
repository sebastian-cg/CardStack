import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { decks } from "../data";

type QuizStats = {
  attempts: number;
  totalCorrect: number;
  totalQuestions: number;
  cardStats: { [cardIndex: number]: { correct: number; attempts: number } };
};

type StreakData = {
  lastActivityDate: string;
  streak: number;
};

export default function StatsScreen() {
  const [quizStats, setQuizStats] = useState<{ [deckId: string]: QuizStats }>(
    {}
  );
  const [streaks, setStreaks] = useState<{ [deckId: string]: StreakData }>({});
  const [globalStreak, setGlobalStreak] = useState<StreakData>({
    lastActivityDate: "",
    streak: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const loadedQuizStats: { [deckId: string]: QuizStats } = {};
      const loadedStreaks: { [deckId: string]: StreakData } = {};

      for (const deck of decks) {
        const storedQuizStats = await AsyncStorage.getItem(
          `quizStats_${deck.id}`
        );
        if (storedQuizStats) {
          loadedQuizStats[deck.id] = JSON.parse(storedQuizStats);
        } else {
          loadedQuizStats[deck.id] = {
            attempts: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            cardStats: {},
          };
        }

        const storedStreak = await AsyncStorage.getItem(`streak_${deck.id}`);
        if (storedStreak) {
          loadedStreaks[deck.id] = JSON.parse(storedStreak);
        } else {
          loadedStreaks[deck.id] = {
            lastActivityDate: "",
            streak: 0,
          };
        }
      }

      const storedGlobalStreak = await AsyncStorage.getItem("globalStreak");
      const globalStreakData = storedGlobalStreak
        ? JSON.parse(storedGlobalStreak)
        : { lastActivityDate: "", streak: 0 };

      setQuizStats(loadedQuizStats);
      setStreaks(loadedStreaks);
      setGlobalStreak(globalStreakData);
    };

    loadStats();
  }, []);

  const totalStats = Object.values(quizStats).reduce(
    (acc, stats) => ({
      attempts: acc.attempts + stats.attempts,
      totalCorrect: acc.totalCorrect + stats.totalCorrect,
      totalQuestions: acc.totalQuestions + stats.totalQuestions,
    }),
    { attempts: 0, totalCorrect: 0, totalQuestions: 0 }
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-blue-500 mb-4">Statistics</Text>
      <View className="bg-white p-4 rounded-lg shadow mb-4">
        <Text className="text-lg font-bold text-green-500 mb-2">
          Overall Stats
        </Text>
        <Text className="text-black mb-1">
          Global Streak: {globalStreak.streak} day
          {globalStreak.streak !== 1 ? "s" : ""}🔥
        </Text>
        <Text className="text-black mb-1">
          Total Quiz Attempts: {totalStats.attempts}
        </Text>
        <Text className="text-black mb-1">
          Lifetime Correct: {totalStats.totalCorrect}/
          {totalStats.totalQuestions}
        </Text>
      </View>
      <Text className="text-lg font-bold text-green-500 mb-2">
        Per-Deck Stats
      </Text>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item: deck }) => {
          const stats = quizStats[deck.id] || {
            attempts: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            cardStats: {},
          };
          const streak = streaks[deck.id] || {
            lastActivityDate: "",
            streak: 0,
          };

          return (
            <View className="bg-white p-4 rounded-lg shadow mb-4">
              <Text className="text-lg font-bold text-pink-500 mb-2">
                {deck.name}
              </Text>
              <Text className="text-gray-500 mb-2">{deck.description}</Text>
              <Text className="text-black mb-1">
                Streak: {streak.streak} day{streak.streak !== 1 ? "s" : ""} 🔥
              </Text>
              <Text className="text-black mb-1">
                Quiz Attempts: {stats.attempts}
              </Text>
              <Text className="text-black mb-1">
                Lifetime Correct: {stats.totalCorrect}/{stats.totalQuestions}
              </Text>
              {Object.keys(stats.cardStats).length > 0 && (
                <>
                  <Text className="text-green-500 font-bold mt-2 mb-1">
                    Card Stats:
                  </Text>
                  {deck.cards.map((card, index) => {
                    const cardStat = stats.cardStats[index] || {
                      correct: 0,
                      attempts: 0,
                    };
                    return (
                      <Text key={index} className="text-black">
                        Card {index + 1} (Question: {card.front}):{" "}
                        {cardStat.correct}/{cardStat.attempts} correct
                      </Text>
                    );
                  })}
                </>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No decks yet. Create one to see stats!
          </Text>
        }
      />
    </View>
  );
}
