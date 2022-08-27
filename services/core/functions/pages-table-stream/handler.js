import { default as PDFDocument } from "pdfkit";
import * as AWS from "aws-sdk";
import { getBookPagesByOrder } from "../../libs";
import { default as stream } from "stream";
import { BookRepository } from "../../libs";

const s3 = new AWS.S3();
const S3_ASSETS_BUCKET_NAME = process.env.S3_ASSETS_BUCKET_NAME;
const SIZE = [595.28, 841.89];

export async function main(event) {
  const promises = event.Records.filter(
    (record) => record.eventName === "MODIFY" || record.eventName === "INSERT"
  ).map(async (record) => {
    const bookId = record["dynamodb"]["NewImage"]["bookId"]["S"];
    const pageImages = await getBookPagesByOrder(bookId);

    const objects = await Promise.all(
      pageImages.map((pageImage) =>
        s3
          .getObject({
            Bucket: S3_ASSETS_BUCKET_NAME,
            Key: pageImage,
          })
          .promise()
      )
    );

    const doc = new PDFDocument({ margin: 0, SIZE });

    for (let i = 0; i < objects.length; i++) {
      doc.image(objects[i].Body, 0, 0, {
        fit: SIZE,
        align: "center",
        valign: "center",
      });
      if (pageImages.length != i + 1) doc.addPage();
    }

    const bookRepository = new BookRepository();
    const book = await bookRepository.get({ Id: bookId });

    doc.end();

    const { stream, promise } = uploadFromStream({
      Bucket: S3_ASSETS_BUCKET_NAME,
      Key: `books/${bookId}/${book.title}.pdf`,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${bookId}.pdf"`,
    });

    doc.pipe(stream);
    return promise;
  });

  const res = await Promise.allSettled(promises);
  console.log(res);
}

function uploadFromStream(params) {
  var pass = new stream.PassThrough();
  var params = { ...params, Body: pass };

  return {
    stream: pass,
    promise: s3.upload(params).promise(),
  };
}
