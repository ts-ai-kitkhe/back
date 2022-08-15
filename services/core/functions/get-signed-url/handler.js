import { getBody } from "../../libs";

var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var bucketName = process.env.AWS_BUCKET_NAME;

exports.main = async (event, context) => {
  const body = getBody(event);
  const bookId = event.pathParameters.id;

  if (!body.hasOwnProperty("contentType")) {
    context.fail({ err: "Missing contentType" });
  }

  if (!body.hasOwnProperty("filePath")) {
    context.fail({ err: "Missing filePath" });
  }

  var params = {
    Bucket: bucketName,
    Key: `books/${bookId}/pages/${body.filePath}`,
    Expires: 3600,
    ContentType: body.contentType,
  };

  const url = s3.getSignedUrl("putObject", params);
  const responseBody = { url };

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};
