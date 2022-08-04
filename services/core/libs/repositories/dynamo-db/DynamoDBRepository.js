export default class DynamoDBRepository {
  constructor(dynamoDbClient, tableName) {
    if (!tableName) {
      throw new Error("tableName not defined in env");
    }
    this.client = dynamoDbClient;
  }

  async get(key, options) {}

  async put(model, options) {}

  async update(model, options) {}

  async delete(key, options) {}

  async scan(options) {}
}
