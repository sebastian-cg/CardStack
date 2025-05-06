import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { decks } from "../../data";

type QuizStats = {
  attempts: number;
  totalCorrect: number;
  totalQuestions: number;
  cardStats: { [cardIndex: number]: { correct: number; attempts: number } };
};

export default function QuizScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const deck = decks.find((d) => d.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats>({
    attempts: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    cardStats: {},
  });
  const [showAssessment, setShowAssessment] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const updateStreaks = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
          .toISOString()
          .split("T")[0];

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
    const loadStats = async () => {
      try {
        const storedStats = await AsyncStorage.getItem(`quizStats_${id}`);
        if (storedStats) {
          setQuizStats(JSON.parse(storedStats));
        }
      } catch (error) {
        console.error("Failed to load quiz stats:", error);
      }
    };
    loadStats();
  }, [id]);

  useEffect(() => {
    const saveStats = async () => {
      try {
        await AsyncStorage.setItem(
          `quizStats_${id}`,
          JSON.stringify(quizStats)
        );
      } catch (error) {
        console.error("Failed to save quiz stats:", error);
      }
    };
    saveStats();
  }, [quizStats, id]);

  const handleTimeout = useCallback(() => {
    setIsCorrect(false);
    setQuizStats((prev) => {
      const updatedCardStats = { ...prev.cardStats };
      if (!updatedCardStats[currentIndex]) {
        updatedCardStats[currentIndex] = { correct: 0, attempts: 0 };
      }
      updatedCardStats[currentIndex].attempts += 1;

      return {
        ...prev,
        attempts: prev.attempts + 1,
        totalQuestions: prev.totalQuestions + 1,
        cardStats: updatedCardStats,
      };
    });
  }, [currentIndex]);

  // Timer countdown
  useEffect(() => {
    let timer: number;
    if (!showAssessment && timeLeft > 0 && isCorrect === null) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isCorrect === null) {
      handleTimeout();
    }
    return () => clearInterval(timer);
  }, [timeLeft, showAssessment, isCorrect, handleTimeout]);

  useEffect(() => {
    if (!showAssessment) {
      setTimeLeft(30);
      setIsCorrect(null);
      setUserAnswer("");
    }
  }, [currentIndex, showAssessment]);

  if (!deck || deck.cards.length === 0) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-2xl font-bold text-black">No Cards to Quiz</Text>
        <Pressable
          className="bg-pink-500 p-3 rounded-lg mt-4"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Back to Deck</Text>
        </Pressable>
      </View>
    );
  }

  const currentCard = deck.cards[currentIndex];

  const handleSubmitAnswer = () => {
    if (userAnswer.trim()) {
      const correctAnswer = currentCard.back.trim().toLowerCase();
      const userInput = userAnswer.trim().toLowerCase();
      const isAnswerCorrect = userInput === correctAnswer;

      setIsCorrect(isAnswerCorrect);

      setQuizStats((prev) => {
        const updatedCardStats = { ...prev.cardStats };
        if (!updatedCardStats[currentIndex]) {
          updatedCardStats[currentIndex] = { correct: 0, attempts: 0 };
        }
        updatedCardStats[currentIndex].attempts += 1;
        if (isAnswerCorrect) {
          updatedCardStats[currentIndex].correct += 1;
        }

        return {
          ...prev,
          attempts: prev.attempts + 1,
          totalCorrect: prev.totalCorrect + (isAnswerCorrect ? 1 : 0),
          totalQuestions: prev.totalQuestions + 1,
          cardStats: updatedCardStats,
        };
      });
    }
  };

  const handleNext = () => {
    if (isCorrect !== null) {
      setUserAnswer("");
      setIsCorrect(null);
      if (currentIndex < deck.cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowAssessment(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setIsCorrect(null);
    setShowAssessment(false);
  };

  if (showAssessment) {
    const correctThisQuiz = deck.cards.reduce((acc, _, index) => {
      if (
        quizStats.cardStats[index] &&
        quizStats.cardStats[index].attempts > 0
      ) {
        return acc + (quizStats.cardStats[index].correct > 0 ? 1 : 0);
      }
      return acc;
    }, 0);

    return (
      <View className="flex-1 bg-gray-100 p-4">
        <Text className="text-2xl font-bold text-blue-500 mb-5">
          Quiz Assessment
        </Text>
        <Text className="text-lg text-black mb-2">
          Score: {correctThisQuiz}/{deck.cards.length}
        </Text>
        <Text className="text-lg text-black mb-2">
          Total Attempts: {quizStats.attempts}
        </Text>
        <Text className="text-lg text-black mb-2">
          Lifetime Correct: {quizStats.totalCorrect}/{quizStats.totalQuestions}
        </Text>
        <Text className="text-lg font-bold text-green-500 mt-4 mb-2">
          Card Stats:
        </Text>
        {deck.cards.map((card, index) => {
          const cardStat = quizStats.cardStats[index] || {
            correct: 0,
            attempts: 0,
          };
          return (
            <View key={index} className="mb-2">
              <Text className="text-black">
                Card {index + 1} (Question: {card.front}): {cardStat.correct}/
                {cardStat.attempts} correct
              </Text>
            </View>
          );
        })}
        <Pressable
          className="bg-pink-500 p-3 rounded-lg mt-4"
          onPress={handleRestart}
        >
          <Text className="text-white text-center font-bold">Restart Quiz</Text>
        </Pressable>
        <Pressable
          className="bg-blue-500 p-3 rounded-lg mt-2"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-bold">Back to Deck</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-xl font-bold text-blue-500 mb-5">
        {deck.name} - Card {currentIndex + 1}/{deck.cards.length}
      </Text>
      <Text className="text-center text-lg text-red-500 mb-2">
        Time Left: {timeLeft}s
      </Text>
      <View className="bg-white p-6 rounded-lg shadow items-center justify-center h-40 mb-5">
        <Text className="text-2xl text-black">{currentCard.front}</Text>
      </View>
      <TextInput
        className="bg-white p-3 rounded-lg mb-4 text-gray-500"
        placeholder="Enter your answer"
        value={userAnswer}
        onChangeText={setUserAnswer}
      />
      {isCorrect !== null && (
        <Text
          className={`text-lg mb-4 ${
            isCorrect ? "text-green-500" : "text-red-500"
          }`}
        >
          {isCorrect
            ? "Correct!"
            : `Incorrect. The answer is: ${currentCard.back}`}
          {timeLeft === 0 && !isCorrect && " (Time's up!)"}
        </Text>
      )}
      <View className="flex-row justify-between">
        <Pressable
          className="bg-pink-500 p-3 rounded-lg"
          onPress={handleSubmitAnswer}
          disabled={!userAnswer.trim() || timeLeft === 0}
        >
          <Text className="text-white">Submit</Text>
        </Pressable>
        {isCorrect !== null && (
          <Pressable
            className="bg-blue-500 p-3 rounded-lg"
            onPress={handleNext}
          >
            <Text className="text-white">
              {currentIndex === deck.cards.length - 1 ? "Finish" : "Next"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
