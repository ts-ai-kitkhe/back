import { BookRepository } from "../../libs";

export async function main() {
  const bookRepository = new BookRepository();
  let books = await bookRepository.scan();
  books = books.sort((a, b) => b.createdAt - a.createdAt);

  return {
    statusCode: 200,
    body: JSON.stringify(books),
  };
}
