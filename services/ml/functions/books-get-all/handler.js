import { getBookData } from "../books-get/handler";
import { BookRepository } from "../../../core/libs";

export async function main() {
  const bookRepository = new BookRepository();

  const books = await bookRepository.scan();
  const bookDatas = await Promise.all(
    books.map((book) =>
      getBookData(book.Id).then((bookData) => ({ id: book.Id, ...bookData }))
    )
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      books: bookDatas,
    }),
  };
}
