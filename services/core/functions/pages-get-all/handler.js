var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var bucketName = process.env.AWS_BUCKET_NAME;

export async function main(event) {
  const bookId = event.pathParameters.id;
  var params = {
    Bucket: bucketName,
    Prefix: `books/${bookId}/pages/`,
  };

  const res = await s3.listObjectsV2(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(
      res.Contents.map((elem) => ({
        url: `https://assets.ts-ai-kitkhe.ge/${elem.Key}`,
      }))
    ),
  };
}
