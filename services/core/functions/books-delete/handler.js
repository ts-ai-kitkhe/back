import { BookRepository } from "../../libs";

export async function main(event) {
  const bookId = event.pathParameters.id;

  const bookRepository = new BookRepository();
  await bookRepository.delete({ Id: bookId });

  return { statusCode: 204 };
}
