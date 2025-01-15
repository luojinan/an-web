import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DictionaryConfigForm } from "../components/DictionaryConfigForm";
import { LearnedWordsConfig } from "../components/LearnedWordsConfig";
import { type DictionaryResource, dictionaries } from "../const/dicts";
import {
	getDictionaries,
	getLearnedWords,
	importLearnedWords,
	importWordsFromUrl,
} from "../utils/index";

interface DataSource {
	id: number;
	url: string;
	name: string;
	createdAt: string;
}

const gitHost =
	"https://raw.gitmirror.com/RealKai42/qwerty-learner/master/public";

export default function DictionaryConfig(): JSX.Element {
	const navigate = useNavigate();
	const [dataUrl, setDataUrl] = useState("");
	const [dataSources, setDataSources] = useState<DataSource[]>([]);
	const [selectedDict, setSelectedDict] = useState<DictionaryResource | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [learnedWordsUrl, setLearnedWordsUrl] = useState("");
	const [importResult, setImportResult] = useState<{
		total: number;
		added: number;
	} | null>(null);
	const [learnedWords, setLearnedWords] = useState<string[]>([]);
	const [showWordsDrawer, setShowWordsDrawer] = useState(false);

	useEffect(() => {
		const fetchLearnedWords = async () => {
			if (showWordsDrawer) {
				const words = await getLearnedWords();
				setLearnedWords(words.map((w) => w.word));
			}
		};
		fetchLearnedWords();
	}, [showWordsDrawer]);

	const [currentDictionary, setCurrentDictionary] = useState<{
		url: string;
		name: string;
		id: string;
		dictionaryId?: number;
	} | null>(null);

	useEffect(() => {
		const loadSources = async () => {
			const dictionaries = await getDictionaries();
			setDataSources(dictionaries);
		};
		loadSources();
	}, []);

	useEffect(() => {
		const storedDict = localStorage.getItem("currentDictionary");
		if (storedDict) {
			setCurrentDictionary(JSON.parse(storedDict));
		}
	}, []);

	const storeDictionary = (url: string) => {
		const storedDict = {
			url,
			name: selectedDict?.name || "Custom Dictionary",
			id: selectedDict?.id || "custom",
		};
		localStorage.setItem("currentDictionary", JSON.stringify(storedDict));
		setCurrentDictionary(storedDict);
		return storedDict;
	};

	const handleImportData = async () => {
		if (!dataUrl) {
			setError("请输入词典URL");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const existingSource = dataSources.find(
				(source) => source.url === dataUrl,
			);

			if (existingSource) {
				storeDictionary(dataUrl);
				console.log("读取本地数据");
				navigate("/");
				return;
			}

			const words = await importWordsFromUrl(dataUrl);
			storeDictionary(dataUrl);
			setDataSources(await getDictionaries());
			console.log("数据导入成功:", words.words.length);
			navigate("/");
		} catch (err) {
			setError(err instanceof Error ? err.message : "导入数据失败");
		} finally {
			setLoading(false);
		}
	};

	const handleImportLearnedWords = async () => {
		if (!learnedWordsUrl) {
			setError("请输入已学单词URL");
			return;
		}

		setLoading(true);
		setError("");
		setImportResult(null);

		try {
			const result = await importLearnedWords(learnedWordsUrl);
			setImportResult(result);
			setLearnedWordsUrl("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "导入已学单词失败");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">词典配置</h1>
			<DictionaryConfigForm
				currentDictionary={currentDictionary}
				loading={loading}
				onImportData={handleImportData}
			/>

			<LearnedWordsConfig
				loading={loading}
				importResult={importResult}
				learnedWords={learnedWords}
				showWordsDrawer={showWordsDrawer}
				onImportLearnedWords={handleImportLearnedWords}
				onShowWordsDrawer={setShowWordsDrawer}
			/>
		</div>
	);
}
