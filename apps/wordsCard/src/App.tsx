import type React from "react";
import { useEffect, useRef, useState } from "react";
import CardProgress from "./components/CardProgress";
import WordCard from "./components/WordCard";
import {
	getCurrentIndex,
	getDataSources,
	getLastFetchedTime,
	getTheme,
	getWordsBySource,
	getWordsFromIndexedDB,
	importWordsFromUrl,
	saveCurrentIndex,
	saveTheme,
	saveWordsToIndexedDB,
} from "./utils/index";
import myWords from "./utils/myWords.json";
const wordsPerPage = 5;

// 顶部工具栏组件
function Toolbar({
	toggleTheme,
	dataUrl,
	setDataUrl,
	handleImportData,
	dataSources,
	currentSource,
	onSwitchSource,
}) {
	return (
		<div className="absolute z-10 top-4 right-4 flex gap-2">
			<label className="swap swap-rotate">
				{/* this hidden checkbox controls the state */}
				<input
					type="checkbox"
					className="theme-controller"
					checked={
						document.documentElement.getAttribute("data-theme") === "black"
					}
					onChange={toggleTheme}
				/>

				{/* sun icon */}
				<svg
					className="swap-off h-10 w-10 fill-current"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
				</svg>

				{/* moon icon */}
				<svg
					className="swap-on h-10 w-10 fill-current"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
				</svg>
			</label>
			<div className="drawer">
				<input id="my-drawer" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content">
					<label
						htmlFor="my-drawer"
						className="btn btn-sm btn-ghost drawer-button"
					>
						⚙️
					</label>
				</div>
				<div className="drawer-side">
					<label
						htmlFor="my-drawer"
						aria-label="close sidebar"
						className="drawer-overlay"
					/>
					<div className="bg-base-100 p-6 w-96 h-full">
						<h2 className="text-xl font-bold mb-4">设置</h2>
						<div className="form-control">
							<label className="label">
								<span className="label-text">数据源</span>
							</label>
							<select
								className="select select-bordered w-full mb-4"
								value={currentSource}
								onChange={(e) => onSwitchSource(e.target.value)}
							>
								<option value="">选择数据源</option>
								{dataSources.map((source) => (
									<option key={source.url} value={source.url}>
										{source.name}
									</option>
								))}
							</select>

							<label className="label">
								<span className="label-text">导入新数据</span>
							</label>
							<input
								type="text"
								placeholder="输入数据URL"
								className="input input-bordered"
								value={dataUrl}
								onChange={(e) => setDataUrl(e.target.value)}
							/>
						</div>
						<div className="mt-4">
							<button
								onClick={handleImportData}
								className="btn btn-primary w-full"
							>
								导入数据
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const App: React.FC = () => {
	const hasRun = useRef(false);
	const [currentIndex, setCurrentIndex] = useState(getCurrentIndex());
	const [lastFetched, setLastFetched] = useState<string | null>(null);
	const [words, setWords] = useState(myWords);
	const [dataUrl, setDataUrl] = useState(""); // https://raw.gitmirror.com/RealKai42/qwerty-learner/master/public/dicts/CET4_T.json
	const [dataSources, setDataSources] = useState<
		Array<{ url: string; name: string }>
	>([]);
	const [currentSource, setCurrentSource] = useState<string>("");

	const handleImportData = async () => {
		if (!dataUrl) return;
		try {
			const words = await importWordsFromUrl(dataUrl);
			setWords(words);
			setDataUrl("");
			loadDataSources();
		} catch (error) {
			alert("导入数据失败");
		}
	};

	const loadDataSources = async () => {
		const sources = await getDataSources();
		setDataSources(sources);
	};

	const handleSwitchSource = async (url: string) => {
		const words = await getWordsBySource(url);
		setWords(words);
		setCurrentSource(url);
		setCurrentIndex(0);
		saveCurrentIndex(0);
	};

	const toggleTheme = () => {
		const currentTheme = document.documentElement.getAttribute("data-theme") as
			| "light"
			| "black";
		const newTheme = currentTheme === "light" ? "black" : "light";
		document.documentElement.setAttribute("data-theme", newTheme);
		saveTheme(newTheme);
	};

	const handleNext = () => {
		if (currentIndex < words.length - wordsPerPage) {
			const newIndex = currentIndex + wordsPerPage;
			setCurrentIndex(newIndex);
			saveCurrentIndex(newIndex);
		}
	};

	const handlePrev = () => {
		if (currentIndex >= wordsPerPage) {
			const newIndex = currentIndex - wordsPerPage;
			setCurrentIndex(newIndex);
			saveCurrentIndex(newIndex);
		}
	};

	const handleJump = (group: number) => {
		const newIndex = (group - 1) * wordsPerPage;
		setCurrentIndex(newIndex);
		saveCurrentIndex(newIndex);
	};

	const initData = async () => {
		const fetchedTime = await getLastFetchedTime();
		console.log("fetchedTime", fetchedTime);
		setLastFetched(fetchedTime);

		if (fetchedTime) {
			const storedWords = await getWordsFromIndexedDB();
			setWords(storedWords);
		} else {
			await saveWordsToIndexedDB(myWords);
		}
	};

	const handleUpdate = async () => {
		await saveWordsToIndexedDB(myWords);
		setWords(myWords);
		setLastFetched(new Date().toISOString());
	};

	useEffect(() => {
		// 初始化时设置主题
		document.documentElement.setAttribute("data-theme", getTheme());
	}, []);

	useEffect(() => {
		// 💩 React StrictMode https://devv.ai/search?threadId=e9l570gexwcg
		if (!hasRun.current) {
			initData();
			hasRun.current = true;
		}
	}, []);

	useEffect(() => {
		loadDataSources();
	}, []);

	return (
		<div className="container min-h-screen mx-auto p-4">
			<Toolbar
				toggleTheme={toggleTheme}
				dataUrl={dataUrl}
				setDataUrl={setDataUrl}
				handleImportData={handleImportData}
				dataSources={dataSources}
				currentSource={currentSource}
				onSwitchSource={handleSwitchSource}
			/>
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
		</div>
	);
};

export default App;
