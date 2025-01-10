import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getFromLocalStorage, saveToLocalStorage } from "./utils/storage";
import { getBooks, saveToIndexDB } from "./utils/indexdb";
import { processIBooksData } from "./utils/parseData";
import type { Annotation, Book } from "./utils/parseData";

type BookIndexDb = Book & { annotations: Annotation[] }

// 顶部工具栏组件
function Toolbar({ theme, toggleTheme, dataUrl, setDataUrl, handleImportData }) {
  return (
    <div className="absolute z-10 top-4 right-4 flex gap-2">
      <button onClick={toggleTheme} className="btn btn-sm btn-ghost">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
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
                <span className="label-text">数据URL</span>
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

// 书籍列表组件
function BookList({ books }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  // 高亮匹配文本的函数
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 text-black">{part}</span>
      ) : (
        part
      )
    );
  };

  // 处理搜索输入变化
  const handleSearchChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set('search', value);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams);
  };

  // 过滤书籍列表
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">已读书籍</h1>

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="form-control">
          <input
            type="text"
            placeholder="搜索书籍..."
            className="input input-bordered w-full max-w-md"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/book/${book.id}`)}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer relative"
            >
              <div className="badge badge-secondary absolute top-2 right-2">
                {book.notesCount} 笔记
              </div>
              <figure>
                <img
                  src="https://placehold.co/200x300"
                  alt={book.title}
                  className="w-full h-64 object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title line-clamp-2" title={book.title}>
                  {highlightText(book.title, searchTerm)}
                </h2>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            未找到匹配的书籍
          </div>
        )}
      </div>
    </div>
  );
}

// 书籍详情组件
function BookDetail({ books }) {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const currentBook = books.find((b) => b.id === bookId);

  if (!currentBook) {
    return <div>书籍未找到</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-ghost mb-4"
      >
        &larr; 返回书单
      </button>
      <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-100px)]">
        <div className="w-full md:w-1/3">
          <img
            src="https://placehold.co/200x300"
            alt={currentBook.title}
            className="w-full rounded-lg shadow-lg"
          />
          <h1 className="text-3xl font-bold mt-4 text-center">
            {currentBook.title}
          </h1>
        </div>
        <div className="w-full md:w-2/3 overflow-y-auto">
          <div className="space-y-4">
            {currentBook.annotations.map((annotation, index) => (
              <div key={index} className="card bg-base-200 p-4">
                <p>🔖 {index + 1}. {annotation.text}</p>
                {annotation.note ? <p>✍️ {annotation.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dataUrl, setDataUrl] = useState(getFromLocalStorage("dataUrl") || "");
  const [books, setBooks] = useState<BookIndexDb[]>([]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleImportData = async () => {
    try {
      saveToLocalStorage("dataUrl", dataUrl);
      const response = await fetch(dataUrl);
      const newBooks = await response.json();
      const processedData = processIBooksData(
        newBooks.books,
        newBooks.annotations
      );
      await saveToIndexDB(processedData);
      console.log("数据已成功保存到 IndexDB");
      alert("数据导入成功！");
    } catch (error) {
      console.error("数据导入失败:", error);
      alert("数据导入失败，请检查URL是否正确");
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await getBooks() as BookIndexDb[]
        setBooks(booksData.filter((book) => book.notesCount));
      } catch (error) {
        console.error("Error loading books:", error);
      }
    };

    loadBooks();
  }, []);

  return (
    <div data-theme={theme} className="min-h-screen">
      <div className="container mx-auto p-4">
        <Toolbar
          theme={theme}
          toggleTheme={toggleTheme}
          dataUrl={dataUrl}
          setDataUrl={setDataUrl}
          handleImportData={handleImportData}
        />

        <Routes>
          <Route path="/" element={<BookList books={books} />} />
          <Route path="/book/:bookId" element={<BookDetail books={books} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;