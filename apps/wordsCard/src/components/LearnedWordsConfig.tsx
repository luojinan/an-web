import { useState } from "react";

interface LearnedWordsConfigProps {
  loading: boolean;
  showWordsDrawer: boolean;
  importResult: {
    total: number;
    added: number;
  } | null;
  learnedWords: string[];
  onImportLearnedWords: (url: string) => Promise<void>;
  onShowWordsDrawer: (show: boolean) => void;
}

export function LearnedWordsConfig({
  loading,
  importResult,
  learnedWords,
  showWordsDrawer,
  onImportLearnedWords,
  onShowWordsDrawer,
}: LearnedWordsConfigProps) {
  const [learnedWordsUrl, setLearnedWordsUrl] = useState("");

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-bold mb-4">已学单词配置</h1>

      <div className="form-control mt-4">
        <label htmlFor="learned-words-url" className="label">
          <span className="label-text">已学单词URL</span>
        </label>
        <input
          id="learned-words-url"
          type="text"
          placeholder="输入已学单词JSON数据URL"
          className="input input-bordered"
          value={learnedWordsUrl}
          onChange={(e) => setLearnedWordsUrl(e.target.value)}
        />
      </div>

      {importResult && (
        <div className="mt-4 p-4 bg-base-200 rounded-lg">
          <p>导入结果:</p>
          <p>总单词数: {importResult.total}</p>
          <p>新增单词数: {importResult.added}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onImportLearnedWords(learnedWordsUrl)}
          className="btn btn-primary flex-1"
          disabled={loading}
        >
          {loading ? "导入中..." : "导入已学单词"}
        </button>
        <button
          type="button"
          onClick={() => onShowWordsDrawer(true)}
          className="btn btn-primary flex-1"
          disabled={loading}
        >
          查看已学单词
        </button>
      </div>

      <div className="drawer drawer-end">
        <input
          id="words-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={showWordsDrawer}
          onChange={(e) => onShowWordsDrawer(e.target.checked)}
        />
        <div className="drawer-side">
          <label
            htmlFor="words-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          />
          <div className="bg-base-200 text-base-content min-h-full w-96 flex flex-col">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4 sticky top-0 bg-base-200 z-10">
                已学单词清单
              </h2>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-2">
                {learnedWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-base-300 text-base-content"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
