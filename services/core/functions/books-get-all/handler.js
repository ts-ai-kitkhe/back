import { BookRepository } from "../../libs";

export async function main() {
  const bookRepository = new BookRepository();
  const books = await bookRepository.scan();

  return {
    statusCode: 200,
    body: JSON.stringify(books),
  };
}
