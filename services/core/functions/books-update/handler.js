import { BookRepository, getBody } from "../../libs";

export async function main(event) {
  const body = getBody(event);
  const bookId = event.pathParameters.id;

  const bookRepository = new BookRepository();
  const book = await bookRepository.update({
    Id: bookId,
    title: body.title,
    authorName: body.authorName,
  });

  return {
    statusCode: 201,
    body: book,
  };
}
