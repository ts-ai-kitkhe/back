import { BaseModel } from "./base-model";

export class BookPages extends BaseModel {
  toJSON() {
    return {
      ...super.toJSON(),
      bookId: this.bookId,
      pages: this.pages,
    };
  }
}
