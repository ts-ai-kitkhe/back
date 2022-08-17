import { BookRepository } from "../../libs";

export async function main() {
  const bookRepository = new BookRepository();
  const books = await bookRepository.scan();
  const authors = new Set();

  books.forEach(function (book) {
    authors.add(book.authorName);
  });

  const authorsSorted = Array.from(authors).sort();

  return {
    statusCode: 200,
    body: JSON.stringify(authorsSorted),
  };
}
