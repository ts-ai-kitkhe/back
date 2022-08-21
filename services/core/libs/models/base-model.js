export class BaseModel {
  createdAt;
  updatedAt;

  toJSON() {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
