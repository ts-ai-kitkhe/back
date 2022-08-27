import DynamoDBRepository from "./DynamoDBRepository";
import { BookPages } from "../../models";

export class BookPagesRepository extends DynamoDBRepository {
  constructor() {
    super(process.env.DYNAMO_DB_PAGES_TABLE_NAME, BookPages);
  }
}
