var bucketName = process.env.S3_ASSETS_BUCKET_NAME;

export async function main(event) {
  const bookId = event.pathParameters.id;
  const filename = event.pathParameters.filename;
  console.log(event);
  console.log(bookId);
  console.log(filename);

  return {
    statusCode: 200,
    body: "body",
  };
}
