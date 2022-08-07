import * as AWS from "aws-sdk";

export default class DynamoDBRepository {
  UPDATED_AT_FIELD_NAME = "updatedAt";
  CREATED_AT_FIELD_NAME = "createdAt";

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
      [this.UPDATED_AT_FIELD_NAME]: now.getTime(),
      [this.CREATED_AT_FIELD_NAME]: now.getTime(),
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
      [this.UPDATED_AT_FIELD_NAME]: now.getTime(),
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
