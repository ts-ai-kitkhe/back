import * as AWS from "aws-sdk";
CREATED_AT_FIELD_NAME = "createdAt";
UPDATED_AT_FIELD_NAME = "updatedAt";

export default class DynamoDBRepository {
  constructor(tableName, Cls) {
    if (!tableName) {
      throw new Error("tableName not defined in env");
    }
    this.tableName = tableName;
    this.Cls = Cls;
    this.client = new AWS.DynamoDB.DocumentClient();
  }

  async get(key, opts) {
    const model = await this.client
      .get({
        TableName: this.tableName,
        Key: key,
        ...opts,
      })
      .promise();
    return Object.assign(new this.Cls(), model.Item);
  }

  async put(item, opts) {
    const now = new Date();
    item = {
      ...item,
      [UPDATED_AT_FIELD_NAME]: now.getTime(),
      [CREATED_AT_FIELD_NAME]: now.getTime(),
    };
    await this.client
      .put({
        TableName: this.tableName,
        Item: item,
        ...opts,
      })
      .promise();
    return Object.assign(new this.Cls(), item);
  }

  async update(item, opts) {
    const now = new Date();
    item = {
      ...item,
      [UPDATED_AT_FIELD_NAME]: now.getTime(),
    };
    await this.client
      .put({
        TableName: this.tableName,
        Item: item,
        ...opts,
      })
      .promise();
    return Object.assign(new this.Cls(), item);
  }

  async delete(key, opts) {
    return this.client
      .delete({
        TableName: this.tableName,
        Key: key,
        ...opts,
      })
      .promise();
  }

  async scan(opts) {
    const data = await this.client
      .scan({
        TableName: this.tableName,
        ...opts,
      })
      .promise();
    return data.Items.map((item) => Object.assign(new this.Cls(), item));
  }
}
