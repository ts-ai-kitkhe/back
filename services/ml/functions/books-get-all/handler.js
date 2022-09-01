import { getBookData } from "../books-get/handler";
import { BookRepository } from "../../../core/libs";

export async function main() {
  const bookRepository = new BookRepository();

  let books = await bookRepository.scan();
  books = books.filter((book) => book.visibility === "Public");

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
