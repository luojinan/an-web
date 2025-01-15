import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardProgress from "../components/CardProgress";
import WordCard from "../components/WordCard";
import {
	getCurrentIndex,
	getWordsBySource,
	saveCurrentIndex,
} from "../utils/index";

interface Word {
	index: number;
	count: number;
	word: string;
	chinese: string;
	note: string | null;
}

const wordsPerPage = 5;

export default function Home() {
	const navigate = useNavigate();
	const hasRun = useRef(false);
	const [currentIndex, setCurrentIndex] = useState(getCurrentIndex());
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
			saveCurrentIndex(newIndex);
		}
	}

	function handlePrev() {
		if (currentIndex >= wordsPerPage) {
			const newIndex = currentIndex - wordsPerPage;
			setCurrentIndex(newIndex);
			saveCurrentIndex(newIndex);
		}
	}

	function handleJump(group: number) {
		const newIndex = (group - 1) * wordsPerPage;
		setCurrentIndex(newIndex);
		saveCurrentIndex(newIndex);
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

		// if (!hasRun.current) {
		// hasRun.current = true;
		// }
	}, [currentDictionary, currentDictionary?.url]);

	return (
		<div className="container min-h-screen mx-auto p-4">
			{currentDictionary ? (
				<>
					<div className="mb-4 p-4 bg-base-200 rounded-lg">
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
			)}
		</div>
	);
}