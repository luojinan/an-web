import type React from "react";
import { useState } from "react";

interface CardProgressProps {
	currentIndex: number;
	total: number;
	onJump: (group: number) => void;
}

const CardProgress: React.FC<CardProgressProps> = ({ currentIndex, total, onJump }) => {
	const currentGroup = Math.floor(currentIndex / 5) + 1;
	const totalGroups = Math.ceil(total / 5);
	const [inputValue, setInputValue] = useState("");

	const handleJump = () => {
		const group = parseInt(inputValue);
		if (!isNaN(group) && group >= 1 && group <= totalGroups) {
			onJump(group);
			setInputValue("");
		}
	};

	return (
		<div className="text-center my-4">
			<div className="mb-2">
				进度: {currentGroup} / {totalGroups}
			</div>
			<div className="flex justify-center items-center gap-2">
				<input
					type="number"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					className="input input-bordered input-sm w-20"
					min="1"
					max={totalGroups}
					placeholder="页数"
				/>
				<button onClick={handleJump} className="btn btn-sm">
					跳转
				</button>
			</div>
		</div>
	);
};

export default CardProgress;
