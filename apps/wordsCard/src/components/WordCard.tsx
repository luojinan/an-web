import type React from "react";
import type { Word } from "../type";

interface Props {
	myWords: Word[];
	currentIndex: number;
	handleNext: () => void;
	handlePrev: () => void;
}

const WordCard: React.FC<Props> = ({ myWords, currentIndex, handleNext, handlePrev }) => {
	const startIndex = Math.floor(currentIndex / 5) * 5;
	const endIndex = Math.min(startIndex + 5, myWords.length);

	return (
		<div className="card w-full max-w-sm mx-auto bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title">单词卡片</h2>
				<ul>
					{myWords.slice(startIndex, endIndex).map((word, index) => (
						<li key={index}>
							单词: {word.word}, 中文: {word.chinese}, 注释: {word.note}, 计数: {word.count}
						</li>
					))}
				</ul>
				<div className="card-actions justify-between">
					<button
						className="btn btn-primary"
						onClick={handlePrev}
						disabled={currentIndex === 0}
					>
						上一张
					</button>
					<button
						className="btn btn-primary"
						onClick={handleNext}
						disabled={currentIndex >= myWords.length - 1}
					>
						下一张
					</button>
				</div>
			</div>
		</div>
	);
};

export default WordCard;
