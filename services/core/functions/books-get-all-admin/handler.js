import { BookRepository } from "../../libs";

export async function main(event) {
  const email = event.requestContext.authorizer.jwt.claims.email;
  const bookRepository = new BookRepository();
  let books = await bookRepository.scan();

  books = books.sort((a, b) => b.createdAt - a.createdAt);
  books = books.filter((book) => book.addedBy === email);

  return {
    statusCode: 200,
    body: JSON.stringify(books),
  };
}
