import { BookRepository, BookPagesRepository } from "../../libs";

const bookRepository = new BookRepository();
const bookPagesRepository = new BookPagesRepository();

export async function main() {
  await truncateDb();
}

async function truncateDb() {
  const [books, bookPages] = await Promise.all([
    bookRepository.scan(),
    bookPagesRepository.scan(),
  ]);

  await Promise.all([
    ...books.map((b) => bookRepository.delete({ Id: b.Id })),
    ...bookPages.map((b) => bookPagesRepository.delete({ bookId: b.bookId })),
  ]);
}
