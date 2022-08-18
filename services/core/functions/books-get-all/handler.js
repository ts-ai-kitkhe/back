import { BookRepository } from "../../libs";

export async function main(event) {
  const bookRepository = new BookRepository();
  let books = await bookRepository.scan();

  books = books.sort((a, b) => b.createdAt - a.createdAt);
  books = books.filter((book) => book.visibility === "Public");

  const params = new URLSearchParams(event.rawQueryString);
  const limit = params.get("limit");

  if (limit && books.length >= limit) {
    books = books.slice(0, limit);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(books),
  };
}
