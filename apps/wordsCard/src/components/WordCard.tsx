import type React from "react";
import { useEffect } from "react";
import type { Word } from "../type";

interface Props {
	myWords: Word[];
	currentIndex: number;
	handleNext: () => void;
	handlePrev: () => void;
}

const WordCard: React.FC<Props> = ({
	myWords,
	currentIndex,
	handleNext,
	handlePrev,
}) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				handlePrev();
			} else if (event.key === "ArrowRight") {
				handleNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleNext, handlePrev]);

	const startIndex = Math.floor(currentIndex / 5) * 5;
	const endIndex = Math.min(startIndex + 5, myWords.length);
	const currentWords = myWords.slice(startIndex, endIndex);

	return (
		<div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title text-2xl mb-4">单词卡片</h2>
				<div className="space-y-4">
					{currentWords.map((word, index) => (
						<div
							key={index}
							className="grid grid-cols-[auto_1fr] gap-4 items-start"
						>
							{/* 序号 */}
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
								{startIndex + index + 1}
							</div>

							{/* 单词信息 */}
							<div className="space-y-1">
								{/* 单词和词频 */}
								<div className="flex items-baseline gap-2">
									<span className="text-2xl font-bold">{word.word}</span>
									<sup className="text-sm text-gray-500">({word.count}次)</sup>
								</div>

								{/* 其他拼写 */}
								{word.note && (
									<div className="text-sm text-gray-500">
										其他拼写: <span className="italic">{word.note}</span>
									</div>
								)}
								{/* 释义 */}
								<div className="text-lg font-medium">{word.chinese}</div>
							</div>
						</div>
					))}
				</div>

				{/* 导航按钮 */}
				<div className="card-actions justify-between mt-6">
					<button
						className="btn btn-primary"
						onClick={handlePrev}
						disabled={currentIndex === 0}
					>
						prev
					</button>
					<button
						className="btn btn-primary"
						onClick={handleNext}
						disabled={currentIndex >= myWords.length - 1}
					>
						next
					</button>
				</div>
			</div>
		</div>
	);
};

export default WordCard;
