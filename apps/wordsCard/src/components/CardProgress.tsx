import type React from "react";

interface CardProgressProps {
	currentIndex: number;
	total: number;
}

const CardProgress: React.FC<CardProgressProps> = ({ currentIndex, total }) => {
	const currentGroup = Math.floor(currentIndex / 5) + 1;
	const totalGroups = Math.ceil(total / 5);

	return (
		<div className="text-center my-4">
			进度: {currentGroup} / {totalGroups}
		</div>
	);
};

export default CardProgress;
