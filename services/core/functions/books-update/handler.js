import { BookRepository } from "../../libs";
import * as multipart from "parse-multipart-data";
import * as AWS from "aws-sdk";

const s3 = new AWS.S3();
const S3_ASSETS_BUCKET_NAME = process.env.S3_ASSETS_BUCKET_NAME;

export async function main(event) {
  const body = Buffer.from(event.body, "base64");
  const bookId = event.pathParameters.id;

  // Parse formData
  const boundary = multipart.getBoundary(event.headers["content-type"]);
  const parts = multipart.parse(body, boundary);
  const bookRepository = new BookRepository();

  // Update cover image
  const coverImage = parts.find((part) => part.name === "cover");
  const coverImagePath =
    coverImage && coverImage.filename
      ? `books/${bookId}/data/${coverImage.filename}`
      : undefined;
  if (coverImagePath) {
    await s3
      .putObject({
        Bucket: S3_ASSETS_BUCKET_NAME,
        Key: coverImagePath,
        Body: coverImage.data,
      })
      .promise();
  }

  // Update book attributes
  const updatedBook = { coverImagePath };
  const bookAttributes = ["title", "authorName", "year", "visibility"];
  parts.map((part) => {
    if (bookAttributes.includes(part.name)) {
      updatedBook[part.name] = part.data.toString();
    }
  });

  const oldBook = await bookRepository.get({ Id: bookId });
  const book = await bookRepository.update({
    ...oldBook,
    ...updatedBook,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(book),
  };
}
