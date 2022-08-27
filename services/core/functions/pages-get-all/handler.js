import { BookPagesRepository } from "../../libs";

var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var bucketName = process.env.AWS_BUCKET_NAME;

export async function main(event) {
  const bookId = event.pathParameters.id;
  const bookPagesRepository = new BookPagesRepository();
  const bookPages = await bookPagesRepository.get({ bookId: bookId });

  const prefix = `books/${bookId}/pages/`;
  var params = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  const s3ListObjectsResult = await s3.listObjectsV2(params).promise();
  const s3ObjectKeys = s3ListObjectsResult.Contents.map((elem) => elem.Key);
  const pagesWithPrefix = bookPages.pages.map((page) => `${prefix}${page}`);
  const filteredPages = pagesWithPrefix.filter((page) =>
    s3ObjectKeys.includes(page)
  );

  return {
    statusCode: 200,
    body: JSON.stringify(
      filteredPages.map((elem) => ({
        url: `https://assets.ts-ai-kitkhe.ge/${elem}`,
      }))
    ),
  };
}
