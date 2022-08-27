import { BaseModel } from "./base-model";

export class BookPages extends BaseModel {
  bookId;
  pages;

  toJSON() {
    return {
      ...super.toJSON(),
      bookId: this.bookId,
      pages: this.pages,
    };
  }
}
