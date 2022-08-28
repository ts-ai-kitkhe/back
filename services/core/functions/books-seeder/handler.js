import { BookRepository } from "../../libs";

const bookRepository = new BookRepository();

export async function main() {
  await seedBooks();
}

async function seedBooks() {
  const books = [
    {
      id: "b32d1f82-f7ac-46f8-a006-d5e92d1df28c",
      title: "ვახტანგ მეექვსის მთარგმნელობითი მოღვაწეობა",
      author: "თენგიზ აბულაძე",
      year: 1990,
    },
    {
      id: "b87a1702-8252-47f7-84c8-dabb10b5a248",
      title: "ბესიკი, თ. ალექსანდრე ჭავჭავაძე, თ. გრიგოლ ორბელიანი",
      author: "ზაქარია მთაწმინდელი",
      year: 1886,
    },
    {
      id: "e6a164c1-fc68-4f19-a0b4-f485d18bed54",
      title: "ბედი ქართლისა",
      author: "კალისტრატე სალია",
      year: 1962,
    },
    {
      id: "e3214268-fcee-4328-82b1-0255728e5b88",
      title: "ბუნების კარი",
      author: "იაკობ გოგებაშვილი",
      year: 1868,
    },
    {
      id: "6ad36770-274f-4c40-8103-ac2efec1cd5c",
      title:
        "ჩემი მოკვლის სამზადისი და სახლის დატყუილების ამბავი ანუ ჩემი თავგადასავალი",
      author: "ზაქარია ჭიჭინაძე",
      year: 1925,
    },
    {
      id: "21c49d20-9ca3-4ec0-b30d-6c3c4f36947a",
      title: "ჭონის შაგირდი",
      author: "ალექსანდრე შახბარათოვი",
      year: 1927,
    },
    {
      id: "72264357-6013-476a-820d-4b532965b82e",
      title: "ერობა და ქალაქი",
      author: "საქართველოს რესპუბლიკის ქალაქთა კავშირის სტამბა",
      year: 1920,
    },
    {
      id: "aa024480-c2d9-4075-b17e-2756d3909086",
      title: "იოსებ ყიფშიძე",
      author: "კორნელი დანელია",
      year: 1985,
    },
    {
      id: "4fe1c950-43cc-4dbb-9a8a-ac93806c4a42",
      title: "გერასიმე კალანდარიშვილი (მონოგრაფია)",
      author: "სოლომონ ცაიშვილი",
      year: 1947,
    },
    {
      id: "0b259bf8-d615-4fd0-9d8a-89cd71b60719",
      title: "კავკასიის ამბების შესახებ",
      author: "მაქსიმ გორკი",
      year: 1936,
    },
    {
      id: "c6b3acf1-fd0c-4aa9-90ac-e630b342de6b",
      title: "ლიუტერის სჯულის ქართველები საქართველოში",
      author: "ზაქარია ჭიჭინაძე",
      year: 1918,
    },
    {
      id: "7acc4f65-c3ea-4ba5-90b3-002efbe04874",
      title: "საქართველო მეთორმეტე საუკუნეში",
      author: "დავით კარიჭაშვილი",
      year: 1902,
    },
    {
      id: "6c943e86-2ce6-40bf-860c-7bb99af82741",
      title: "სვიმონ მეფე",
      author: "დავით კარიჭაშვილი",
      coverImagePath:
        "books/6c943e86-2ce6-40bf-860c-7bb99af82741/data/0001.jpg",
      year: 1894,
    },
    {
      id: "dd47ac25-7ba5-4c99-aa0b-872146d5e527",
      title: "ილია ჭავჭავაძის ფილოსოფიური და ესთეტიკური შეხედულებანი",
      author: "ამბროსი თავაძე",
      year: 1954,
    },
    {
      id: "8e54e050-0cf6-4d49-b5c7-a62730f3c0fc",
      title: "წიგნის ისტორია",
      author: "დავით კარიჭაშვილი",
      year: 1903,
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
