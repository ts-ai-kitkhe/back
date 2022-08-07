import { BookRepository, getBody } from "../../libs";
import { v4 as uuidv4 } from "uuid";

export async function main(event, context) {
  const body = getBody(event);

  const bookRepository = new BookRepository();
  const book = await bookRepository.put({
    Id: uuidv4(),
    title: body.title,
    authorName: body.authorName,
  });

  return {
    statusCode: 201,
    body: book,
  };
}
