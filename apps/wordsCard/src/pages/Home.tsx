import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardProgress from "../components/CardProgress";
import WordCard from "../components/WordCard";
import { useCurrentIndex } from "../hooks";
import type { Word } from "../type";
import { getWordsBySource } from "../utils/index";

const wordsPerPage = 5;

export default function Home() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useCurrentIndex();
  const [words, setWords] = useState<Word[]>([]);
  const [currentDictionary, setCurrentDictionary] = useState<{
    url: string;
    name: string;
    id: string;
    dictionaryId?: number;
  } | null>(null);

  function handleNext() {
    if (currentIndex < words.length - wordsPerPage) {
      const newIndex = currentIndex + wordsPerPage;
      setCurrentIndex(newIndex);
    }
  }

  function handlePrev() {
    if (currentIndex >= wordsPerPage) {
      const newIndex = currentIndex - wordsPerPage;
      setCurrentIndex(newIndex);
    }
  }

  function handleJump(group: number) {
    const newIndex = (group - 1) * wordsPerPage;
    setCurrentIndex(newIndex);
  }

  useEffect(() => {
    // Load current dictionary from localStorage
    const storedDict = localStorage.getItem("currentDictionary");
    if (storedDict) {
      setCurrentDictionary(JSON.parse(storedDict));
    }
  }, []);

  useEffect(() => {
    async function initData() {
      if (currentDictionary?.url) {
        const storedWords = await getWordsBySource(currentDictionary.url);
        setWords(storedWords);
      }
    }
    initData();
  }, [currentDictionary, currentDictionary?.url]);

  return currentDictionary ? (
    <>
      <div className="p-4 bg-base-200 rounded-lg">
        <p className="text-sm">当前词典: {currentDictionary.name}</p>
        <p className="text-xs text-base-content/70">
          词典URL: {currentDictionary.url}
        </p>
      </div>

      <WordCard
        myWords={words}
        currentIndex={currentIndex}
        handleNext={handleNext}
        handlePrev={handlePrev}
      />
      <CardProgress
        currentIndex={currentIndex}
        total={words.length}
        onJump={handleJump}
      />
    </>
  ) : (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">未选择词典</h2>
        <p className="mb-6 text-base-content/80">
          请先选择或导入一个词典以开始学习
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/config")}
        >
          去配置
        </button>
      </div>
    </div>
  );
}
