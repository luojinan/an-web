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

	const toOulu = (word: string) => {
		const url = "https://dict.eudic.net/dicts/en/";
		window.open(url + word, "_blank");
	};

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
									<span
										className="text-2xl font-bold cursor-pointer hover:text-blue-500"
										onClick={() => toOulu(word.word || word.name)}
									>
										{word.word || word.name}
									</span>
									<button
										onClick={() => {
											const audio = new Audio(
												`https://dict.youdao.com/dictvoice?audio=${word.word || word.name}&type=2`,
											);
											audio.play();
										}}
									>
										<svg viewBox="0 0 24 24" width="1.2em" height="1.2em">
											<g fill="currentColor">
												<path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.8 9.8 0 0 0 1.5 12c0 .898.121 1.768.35 2.595c.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06zm5.084 1.046a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06a8.25 8.25 0 0 0 0-11.668a.75.75 0 0 1 0-1.06"></path>
												<path d="M15.932 7.757a.75.75 0 0 1 1.061 0a6 6 0 0 1 0 8.486a.75.75 0 0 1-1.06-1.061a4.5 4.5 0 0 0 0-6.364a.75.75 0 0 1 0-1.06"></path>
											</g>
										</svg>
									</button>
									{word.count ? (
										<sup className="text-sm text-gray-500">
											({word.count || "-"}次)
										</sup>
									) : null}
								</div>

								{/* 其他拼写 */}
								{word.note && (
									<div className="text-sm text-gray-500">
										其他拼写: <span className="italic">{word.note}</span>
									</div>
								)}
								{/* 释义 */}
								<div className="text-lg font-medium">
									{word.chinese || word?.trans?.join?.()}
								</div>
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
