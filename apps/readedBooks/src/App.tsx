import { useEffect, useState } from "react";
import { getFromLocalStorage, saveToLocalStorage } from "./utils/storage";
import { getBooks, saveToIndexDB } from "./utils/indexdb";
import { processIBooksData } from "./utils/parseData";
import type { Annotation, Book } from "./utils/parseData";

type BookIndexDb = Book & {annotations: Annotation[]}

function App() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dataUrl, setDataUrl] = useState(getFromLocalStorage("dataUrl") || "");

  const [books, setBooks] = useState<BookIndexDb[]>([]);

  // 获取当前选中的书籍
  const currentBook = books.find((b) => b.id === selectedBook);

  // 切换主题
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
        {/* 顶部操作按钮 */}
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

        {!selectedBook ? (
          // 书籍列表视图
          <div>
            <h1 className="text-3xl font-bold mb-8">已读书籍</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book.id)}
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
                    <h2 className="card-title">{book.title}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // 书籍详情视图
          <div>
            <button
              onClick={() => setSelectedBook(null)}
              className="btn btn-ghost mb-4"
            >
              &larr; 返回书单
            </button>

            {currentBook && (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3">
                  <img
                    src="https://placehold.co/200x300"
                    alt={currentBook.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div className="w-full md:w-2/3">
                  <h1 className="text-3xl font-bold mb-4">
                    {currentBook.title}
                  </h1>
                  <div className="space-y-4">
                    {currentBook.annotations.map((annotation, index) => (
                      <div key={index} className="card bg-base-200 p-4">
                        {/* <div className="text-sm text-gray-500 mb-2">
                          第 {highlight.page} 页
                        </div> */}
                        <p>🔖 {index+1}. {annotation.text}</p>
                        {annotation.note ? <p>✍️ {annotation.note}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
