import { BaseModel } from "./base-model";

export class Book extends BaseModel {
  Id;
  title;
  authorName;
  year;
  visibility;
  addedBy;
  coverImagePath;
}
