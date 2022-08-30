import { default as PDFDocument } from "pdfkit";
import * as AWS from "aws-sdk";
import { getBookPagesByOrder } from "../../libs";
import { default as stream } from "stream";
import { BookRepository } from "../../libs";

const s3 = new AWS.S3();
const eventbridge = new AWS.EventBridge();
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

    const pdfKey = `books/${bookId}/${book.title}.pdf`;
    const { stream, promise } = uploadFromStream({
      Bucket: S3_ASSETS_BUCKET_NAME,
      Key: pdfKey,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${bookId}.pdf"`,
    });

    doc.pipe(stream);
    await promise;

    book.bookPdfPath = pdfKey;
    await bookRepository.update(book);

    const pageId = pageImages[0].split("/").pop().split(".").shift();
    await eventbridge
      .putEvents({
        Entries: [
          {
            Source: "core",
            Detail: JSON.stringify({
              bucket: {
                name: S3_ASSETS_BUCKET_NAME,
              },
              object: {
                key: `books/${bookId}/pages/text/${pageId}.txt`,
              },
            }),
            DetailType: "Book Pages Updated",
          },
        ],
      })
      .promise();
  });

  const res = await Promise.allSettled(promises);
}

function uploadFromStream(params) {
  var pass = new stream.PassThrough();
  var params = { ...params, Body: pass };

  return {
    stream: pass,
    promise: s3.upload(params).promise(),
  };
}
