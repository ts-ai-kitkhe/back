import { getBody } from "../../../core/libs";
import * as AWS from "aws-sdk";

const S3_ML_BUCKET_NAME = process.env.S3_ML_BUCKET_NAME;

const s3 = new AWS.S3();
export async function main(event) {
  const bookId = event.pathParameters.id;
  const filename = event.pathParameters.filename;
  const { updatedRects } = getBody(event);
  const { added, modified, deleted } = updatedRects;

  const object = await s3
    .getObject({
      Bucket: S3_ML_BUCKET_NAME,
      Key: `books/${bookId}/pages/predictions/${filename}.json`,
    })
    .promise();

  if (!object || !object.Body) {
    return { statusCode: 404 };
  }

  const data = JSON.parse(object.Body);

  if (added) {
    const newRects = added.map((box) => ({
      id: box.id,
      letter: box.letter,
      confidence: 1,
      corners: [
        [box.x, box.y],
        [box.x + box.w, box.y],
        [box.x, box.y + box.h],
        [box.x + box.w, box.y + box.h],
      ],
      top_letters: [box.letter],
      top_confidences: [1],
    }));
    data = [...data.data, ...newRects];
  }

  if (modified) {
    modified.map((box) => {
      const oldBox = data.data.find(({ id }) => id === box.id);
      if (!oldBox) {
        console.error(`Couldn't find box with id: ${box.id}`);
        return;
      }
      const updatedBox = {
        id: box.id,
        letter: box.letter,
        confidence: 1,
        corners: [
          [box.x, box.y],
          [box.x + box.w, box.y],
          [box.x, box.y + box.h],
          [box.x + box.w, box.y + box.h],
        ],
        top_letters: [box.letter],
        top_confidences: [1],
      };
      Object.assign(oldBox, updatedBox);
    });
  }

  if (deleted) {
    data.data = data.data.filter((box) => !deleted.includes(box.id));
  }

  await s3
    .putObject({
      Bucket: S3_ML_BUCKET_NAME,
      Key: `books/${bookId}/pages/predictions/${filename}.json`,
      Body: JSON.stringify(data),
    })
    .promise();

  return { statusCode: 204 };
}
