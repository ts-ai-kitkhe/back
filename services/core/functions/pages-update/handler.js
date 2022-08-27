import { BookPagesRepository, getBody } from "../../libs";

export async function main(event) {
  const body = getBody(event);
  const pages = [...new Set(body.pages)];
  const bookId = event.pathParameters.id;

  const bookPagesRepository = new BookPagesRepository();
  const bookPages = await bookPagesRepository.put({
    bookId: bookId,
    pages: pages,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(bookPages),
  };
}
