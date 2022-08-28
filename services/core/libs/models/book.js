import { BaseModel } from "./base-model";

export class Book extends BaseModel {
  get coverImageUrl() {
    return this.coverImagePath
      ? `https://assets.ts-ai-kitkhe.ge/${this.coverImagePath}`
      : undefined;
  }

  get bookPdfUrl() {
    return this.bookPdfPath
      ? `https://assets.ts-ai-kitkhe.ge/${this.bookPdfPath}`
      : undefined;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      Id: this.Id,
      title: this.title,
      authorName: this.authorName,
      year: this.year,
      visibility: this.visibility,
      addedBy: this.addedBy,
      coverImagePath: this.coverImagePath,
      coverImageUrl: this.coverImageUrl,
      bookPdfPath: this.bookPdfPath,
      bookPdfUrl: this.bookPdfUrl,
    };
  }
}
