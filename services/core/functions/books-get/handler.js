import { BookRepository } from "../../libs";

export async function main(event, context) {
  const bookRepository = new BookRepository();
  const book = await bookRepository.get({ Id: event.pathParameters.id });

  return {
    statusCode: 200,
    body: JSON.stringify(book),
  };
}
