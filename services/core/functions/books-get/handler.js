import { BookRepository } from "../../libs";

export async function main(event) {
  const bookId = event.pathParameters.id;

  const bookRepository = new BookRepository();
  const book = await bookRepository.get({ Id: bookId });

  return {
    statusCode: 200,
    body: JSON.stringify(book),
  };
}
