import { useState } from "react";
import { type DictionaryResource, dictionaries } from "../const/dicts";

interface DictionaryConfigFormProps {
	currentDictionary: {
		url: string;
		name: string;
		id: string;
		dictionaryId?: number;
	} | null;
	loading: boolean;
	onImportData: (
		dictInfo: DictionaryResource & { dataUrl?: string },
	) => Promise<void>;
}

export function DictionaryConfigForm({
	currentDictionary,
	loading,
	onImportData,
}: DictionaryConfigFormProps) {
	const [dataUrl, setDataUrl] = useState("");
	const [selectedDict, setSelectedDict] = useState<DictionaryResource | null>(
		null,
	);
	const [customUrl, setCustomUrl] = useState("");

	const gitHost =
		"https://raw.gitmirror.com/RealKai42/qwerty-learner/master/public";

	return (
		<>
			{currentDictionary && (
				<div className="mb-4 p-4 bg-base-200 rounded-lg">
					<p className="text-sm">当前词典: {currentDictionary.name}</p>
					<p className="text-xs text-base-content/70">
						词典URL: {currentDictionary.url}
					</p>
				</div>
			)}

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
					onClick={() => onImportData({ ...selectedDict, dataUrl })}
					className="btn btn-primary w-full"
					disabled={loading}
				>
					{loading ? "导入中..." : "导入数据"}
				</button>
			</div>
		</>
	);
}
