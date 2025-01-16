import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DictionaryConfigForm } from "../components/DictionaryConfigForm";
import { LearnedWordsConfig } from "../components/LearnedWordsConfig";
import type { DictionaryResource } from "../const/dicts";
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

export default function DictionaryConfig(): JSX.Element {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const storeDictionary = (dictInfo: DictionaryResource) => {
    const storedDict = {
      url: dictInfo?.dataUrl,
      name: dictInfo?.name || "Custom Dictionary",
      id: dictInfo?.id || "custom",
    };
    localStorage.setItem("currentDictionary", JSON.stringify(storedDict));
    setCurrentDictionary(storedDict);
    return storedDict;
  };

  const handleImportData = async (dictInfo: DictionaryResource) => {
    const { dataUrl } = dictInfo || {};
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
        storeDictionary(dictInfo);
        console.log("读取本地数据");
        navigate("/");
        return;
      }

      const words = await importWordsFromUrl(dataUrl);
      storeDictionary(dictInfo);
      setDataSources(await getDictionaries());
      console.log("数据导入成功:", words.words.length);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleImportLearnedWords = async (url: string) => {
    if (!url) {
      setError("请输入已学单词URL");
      return;
    }

    setLoading(true);
    setError("");
    setImportResult(null);

    try {
      const result = await importLearnedWords(url);
      setImportResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入已学单词失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
    </>
  );
}
