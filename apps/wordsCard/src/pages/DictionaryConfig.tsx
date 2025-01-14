import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type DictionaryResource, dictionaries } from "../const/dicts";
import { getDictionaries, importWordsFromUrl } from "../utils/index";

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
	const [customUrl, setCustomUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

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
		// Load current dictionary from localStorage
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

				// 跳转到首页
				navigate("/");
				return;
			}

			const words = await importWordsFromUrl(dataUrl);
			storeDictionary(dataUrl);
			setDataSources(await getDictionaries());
			console.log("数据导入成功:", words.words.length);
			// 跳转到首页
			navigate("/");
		} catch (err) {
			setError(err instanceof Error ? err.message : "导入数据失败");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">词典配置</h1>

			{currentDictionary ? (
				<div className="mb-4 p-4 bg-base-200 rounded-lg">
					<p className="text-sm">当前词典: {currentDictionary.name}</p>
					<p className="text-xs text-base-content/70">
						词典URL: {currentDictionary.url}
					</p>
				</div>
			) : null}

			<div className="form-control mt-4">
				<label htmlFor="dictionary-select" className="label">
					<span className="label-text">选择词典</span>
				</label>
				<select
					id="dictionary-select"
					className="select select-bordered w-full"
					value={selectedDict?.id || ""}
					onChange={(e) => {
						const dict = dictionaries.find((d) => d.id === e.target.value);
						setSelectedDict(dict || null);
						setDataUrl(dict ? `${gitHost}${dict.url}` : "");
					}}
				>
					<option value="">选择词典</option>
					{dictionaries.map((dict) => (
						<option key={dict.id} value={dict.id}>
							{dict.name}
						</option>
					))}
				</select>
			</div>

			<div className="form-control mt-4">
				<label htmlFor="custom-url" className="label">
					<span className="label-text">自定义词典URL</span>
				</label>
				<input
					id="custom-url"
					type="text"
					placeholder="输入自定义词典URL"
					className="input input-bordered"
					value={customUrl}
					onChange={(e) => {
						setCustomUrl(e.target.value);
						setDataUrl(e.target.value);
					}}
				/>
			</div>

			{selectedDict && (
				<div className="mt-4 p-4 bg-base-200 rounded-lg">
					<p>当前词典: {selectedDict.name}</p>
					<p>词典URL: {selectedDict.url}</p>
				</div>
			)}

			<div className="mt-4">
				<button
					type="button"
					onClick={handleImportData}
					className="btn btn-primary w-full"
					disabled={loading}
				>
					{loading ? "导入中..." : "导入数据"}
				</button>
			</div>
		</div>
	);
}
