import { BookRepository, BookPagesRepository } from "../../libs";

const bookRepository = new BookRepository();
const bookPagesRepository = new BookPagesRepository();

export async function main() {
  await seedBooks();
  await seedBookPages();
}

async function seedBooks() {
  const books = [
    {
      id: "b32d1f82-f7ac-46f8-a006-d5e92d1df28c",
      title: "ვახტანგ მეექვსის მთარგმნელობითი მოღვაწეობა",
      author: "თენგიზ აბულაძე",
      year: 1990,
      coverImagePath:
        "books/b32d1f82-f7ac-46f8-a006-d5e92d1df28c/data/vaxtang VI-is mtargmnelobiti.jpg",
    },
    {
      id: "b87a1702-8252-47f7-84c8-dabb10b5a248",
      title: "ბესიკი, თ. ალექსანდრე ჭავჭავაძე, თ. გრიგოლ ორბელიანი",
      author: "ზაქარია მთაწმინდელი",
      year: 1886,
      coverImagePath:
        "books/b87a1702-8252-47f7-84c8-dabb10b5a248/data/Besiki Chavchavadze Orbeliani-1886.jpg",
    },
    {
      id: "e6a164c1-fc68-4f19-a0b4-f485d18bed54",
      title: "ბედი ქართლისა",
      author: "კალისტრატე სალია",
      year: 1962,
      coverImagePath:
        "books/e6a164c1-fc68-4f19-a0b4-f485d18bed54/data/bedi kartlisa 1962.jpg",
    },
    {
      id: "e3214268-fcee-4328-82b1-0255728e5b88",
      title: "ბუნების კარი",
      author: "იაკობ გოგებაშვილი",
      year: 1868,
      coverImagePath:
        "books/e3214268-fcee-4328-82b1-0255728e5b88/data/Bunebis Kari-1868.jpg",
    },
    {
      id: "6ad36770-274f-4c40-8103-ac2efec1cd5c",
      title:
        "ჩემი მოკვლის სამზადისი და სახლის დატყუილების ამბავი ანუ ჩემი თავგადასავალი",
      author: "ზაქარია ჭიჭინაძე",
      year: 1925,
      coverImagePath:
        "books/6ad36770-274f-4c40-8103-ac2efec1cd5c/data/Chemi mokvlis samzadisi-1925.jpg",
    },
    {
      id: "aa024480-c2d9-4075-b17e-2756d3909086",
      title: "იოსებ ყიფშიძე",
      author: "კორნელი დანელია",
      year: 1985,
      coverImagePath:
        "books/aa024480-c2d9-4075-b17e-2756d3909086/data/Danelia - Kipshidze.jpg",
    },
    {
      id: "4fe1c950-43cc-4dbb-9a8a-ac93806c4a42",
      title: "გერასიმე კალანდარიშვილი (მონოგრაფია)",
      author: "სოლომონ ცაიშვილი",
      year: 1947,
      coverImagePath:
        "books/4fe1c950-43cc-4dbb-9a8a-ac93806c4a42/data/Solomon Tsaishvili 1947.jpg",
    },
    {
      id: "7acc4f65-c3ea-4ba5-90b3-002efbe04874",
      title: "საქართველო მეთორმეტე საუკუნეში",
      author: "დავით კარიჭაშვილი",
      year: 1902,
      coverImagePath:
        "books/7acc4f65-c3ea-4ba5-90b3-002efbe04874/data/Karichashvili Sakartvelo me12 sk. 1902.jpg",
    },
    {
      id: "6c943e86-2ce6-40bf-860c-7bb99af82741",
      title: "სვიმონ მეფე",
      author: "დავით კარიჭაშვილი",
      year: 1894,
      coverImagePath:
        "books/6c943e86-2ce6-40bf-860c-7bb99af82741/data/Svimon Mepe-1894.jpg",
    },
    {
      id: "dd47ac25-7ba5-4c99-aa0b-872146d5e527",
      title: "ილია ჭავჭავაძის ფილოსოფიური და ესთეტიკური შეხედულებანი",
      author: "ამბროსი თავაძე",
      year: 1954,
      coverImagePath:
        "books/dd47ac25-7ba5-4c99-aa0b-872146d5e527/data/Tavadze-Ilia Chavchvadzis 1954.jpg",
    },
    {
      id: "8e54e050-0cf6-4d49-b5c7-a62730f3c0fc",
      title: "წიგნის ისტორია",
      author: "დავით კარიჭაშვილი",
      year: 1903,
      coverImagePath:
        "books/8e54e050-0cf6-4d49-b5c7-a62730f3c0fc/data/Tsignis Istoria Karichashvili 1903.jpg",
    },
  ];

  return Promise.all(
    books.map((book) =>
      bookRepository.put({
        Id: book.id,
        title: book.title,
        authorName: book.author,
        year: book.year,
        coverImagePath: book.coverImagePath,
        visibility: "Public",
        addedBy: "tdavi18@freeuni.edu.ge",
      })
    )
  );
}

async function seedBookPages() {
  const bookPages = [
    {
      bookId: "b32d1f82-f7ac-46f8-a006-d5e92d1df28c",
      pages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    },
    {
      bookId: "b87a1702-8252-47f7-84c8-dabb10b5a248",
      pages: ["1.jpg", "2.jpg", "3.jpg"],
    },
    {
      bookId: "e6a164c1-fc68-4f19-a0b4-f485d18bed54",
      pages: ["1.jpg", "2.jpg", "3.jpg"],
    },
    {
      bookId: "e3214268-fcee-4328-82b1-0255728e5b88",
      pages: ["1.jpg", "2.jpg", "3.jpg"],
    },
    {
      bookId: "6ad36770-274f-4c40-8103-ac2efec1cd5c",
      pages: ["1.jpg", "2.jpg", "3.jpg"],
    },
    {
      bookId: "aa024480-c2d9-4075-b17e-2756d3909086",
      pages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg"],
    },
    {
      bookId: "4fe1c950-43cc-4dbb-9a8a-ac93806c4a42",
      pages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    },
    {
      bookId: "7acc4f65-c3ea-4ba5-90b3-002efbe04874",
      pages: ["1.jpg", "2.jpg", "3.jpg"],
    },
    {
      bookId: "6c943e86-2ce6-40bf-860c-7bb99af82741",
      pages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"],
    },
    {
      bookId: "dd47ac25-7ba5-4c99-aa0b-872146d5e527",
      pages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    },
    {
      bookId: "8e54e050-0cf6-4d49-b5c7-a62730f3c0fc",
      pages: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"],
    },
  ];

  return Promise.all(
    bookPages.map((bookPage) =>
      bookPagesRepository.put({
        bookId: bookPage.bookId,
        pages: bookPage.pages,
      })
    )
  );
}
