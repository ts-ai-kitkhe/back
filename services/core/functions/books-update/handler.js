import { BookRepository, getBody } from "../../libs";

export async function main(event) {
  const body = getBody(event);
  const bookId = event.pathParameters.id;

  const bookRepository = new BookRepository();
  const book = await bookRepository.update({
    ...(await bookRepository.get({ Id: bookId })),
    title: body.title,
    authorName: body.authorName,
    year: body.year,
    visibility: body.visibility,
  });

  return {
    statusCode: 201,
    body: JSON.stringify(book),
  };
}
