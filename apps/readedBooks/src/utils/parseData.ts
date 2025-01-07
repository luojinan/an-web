export interface Book {
  id: string
  title: string
  author: string
  path: string
  notesCount?: number
}

export interface Annotation {
  book_id: string
  text: string
  note: string
}

export interface IBooksData {
  books: Book[]
  annotations: Annotation[]
  lastUpdated?: number
}
export interface ProcessedIBooksData {
  books: Book[]
  annotationsByBookId: Record<string, Annotation[]>
}

export const processIBooksData = (books: Book[], annotations: Annotation[]): ProcessedIBooksData => {
  const annotationsByBookId: Record<string, Annotation[]> = {}

  annotations.forEach(annotation => {
    if (!annotationsByBookId[annotation.book_id]) {
      annotationsByBookId[annotation.book_id] = []
    }
    annotationsByBookId[annotation.book_id].push(annotation)
  })

  const booksWithNotes = books.map(book => ({
    ...book,
    notesCount: annotationsByBookId[book.id]?.length || 0
  }))

  return {
    books: booksWithNotes,
    annotationsByBookId
  }
}