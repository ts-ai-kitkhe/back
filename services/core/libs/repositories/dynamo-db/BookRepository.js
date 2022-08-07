import DynamoDBRepository from "./DynamoDBRepository";
import { Book } from "../../models";

export class BookRepository extends DynamoDBRepository {
  constructor() {
    super(process.env.DYNAMO_DB_BOOKS_TABLE_NAME, Book);
  }
}
