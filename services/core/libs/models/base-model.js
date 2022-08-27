export class BaseModel {
  toJSON() {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
