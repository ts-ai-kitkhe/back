import DynamoDBRepository from "./DynamoDBRepository";

const DYNAMO_DB_BOOKS_TABLE_NAME = process.env.DYNAMO_DB_BOOKS_TABLE_NAME;

export class BookRepository extends DynamoDBRepository {
  constructor(dynamoDBClient) {
    super(dynamoDBClient, DYNAMO_DB_BOOKS_TABLE_NAME);
  }
}
