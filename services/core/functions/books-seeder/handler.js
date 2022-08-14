import { BookRepository } from "../../libs";
import { v4 as uuidv4 } from "uuid";

export async function main() {
  const bookRepository = new BookRepository();
  const books = [
    {
      title: "ვახტანგ მეექვსის მთარგმნელობითი მოღვაწეობა",
      author: "თენგიზ აბულაძე",
      year: 1990,
    },
    {
      title: "ბესიკი, თ. ალექსანდრე ჭავჭავაძე, თ. გრიგოლ ორბელიანი",
      author: "ზაქარია მთაწმინდელი",
      year: 1886,
    },
    {
      title: "ბედი ქართლისა",
      author: "კალისტრატე სალია",
      year: 1962,
    },
    {
      title: "ბუნების კარი",
      author: "იაკობ გოგებაშვილი",
      year: 1868,
    },
    {
      title: "ჭანეთი (ლაზეთი)",
      author: "იური სიხარულიძე",
      year: 1979,
    },
    {
      title:
        "ჩემი მოკვლის სამზადისი და სახლის დატყუილების ამბავი ანუ ჩემი თავგადასავალი",
      author: "ზაქარია ჭიჭინაძე",
      year: 1925,
    },
    {
      title: "ჭონის შაგირდი",
      author: "ალექსანდრე შახბარათოვი",
      year: 1927,
    },
    {
      title: "რჩეული თხზულებანი",
      author: "იოსებ ყოფშიძე",
      year: 1994,
    },
    {
      title: "დიდებული საქმე ქართველი ერისა",
      author: "ზაქარია ჭიჭინაძე",
      year: 1908,
    },
    {
      title: "ერობა და ქალაქი",
      author: "საქართველოს რესპუბლიკის ქალაქთა კავშირის სტამბა",
      year: 1920,
    },
    {
      title: "იოსებ ყიფშიძე",
      author: "კორნელი დანელია",
      year: 1985,
    },
    {
      title: "გერასიმე კალანდარიშვილი (მონოგრაფია)",
      author: "სოლომონ ცაიშვილი",
      year: 1947,
    },
    {
      title: "კავკასიის ამბების შესახებ",
      author: "მაქსიმ გორკი",
      year: 1936,
    },
    {
      title: "ლიუტერის სჯულის ქართველები საქართველოში",
      author: "ზაქარია ჭიჭინაძე",
      year: 1918,
    },
    {
      title: "საქართველო მეთორმეტე საუკუნეში",
      author: "დავით კარიჭაშვილი",
      year: 1902,
    },
    {
      title: "სვიმონ მეფე",
      author: "დავით კარიჭაშვილი",
      year: 1894,
    },
    {
      title: "ილია ჭავჭავაძის ფილოსოფიური და ესთეტიკური შეხედულებანი",
      author: "ამბროსი თავაძე",
      year: 1954,
    },
    {
      title: "წიგნის ისტორია",
      author: "დავით კარიჭაშვილი",
      year: 1903,
    },
  ];

  for (const book of books) {
    await bookRepository.put({
      Id: uuidv4(),
      title: book.title,
      authorName: book.author,
      year: book.year,
    });
  }
}