var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var bucketName = process.env.AWS_BUCKET_NAME;

export async function main(event) {
  const bookId = event.pathParameters.id;
  const filename = event.pathParameters.filename;

  var params = {
    Bucket: bucketName,
    Key: `books/${bookId}/pages/${filename}`,
  };
  await s3.deleteObject(params).promise();

  return { statusCode: 204 };
}
