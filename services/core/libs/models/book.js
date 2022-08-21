import { BaseModel } from "./base-model";

export class Book extends BaseModel {
  Id;
  title;
  authorName;
  year;
  visibility;
  addedBy;
  coverImagePath;

  get coverImageUrl() {
    return this.coverImagePath
      ? `https://assets.ts-ai-kitkhe.ge/${this.coverImagePath}`
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
    };
  }
}
