import * as AWS from "aws-sdk";

const S3_ML_BUCKET_NAME = process.env.S3_ML_BUCKET_NAME;

const s3 = new AWS.S3();
export async function main(event) {
  const bookId = event.pathParameters.id;

  const bookData = await getBookData(bookId);

  if (!bookData) {
    return { statusCode: 404 };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(bookData),
  };
}

export async function getBookData(bookId) {
  const prefix = `books/${bookId}/pages/predictions`;
  var params = {
    Bucket: S3_ML_BUCKET_NAME,
    Prefix: prefix,
  };

  const s3ListObjectsResult = await s3.listObjectsV2(params).promise();
  if (
    !s3ListObjectsResult.Contents ||
    s3ListObjectsResult.Contents.length === 0
  ) {
    return {
      confidence: 0,
    };
  }

  const objects = await Promise.all(
    s3ListObjectsResult.Contents.map((elem) => elem.Key)
      .filter((key) => key.endsWith(".json"))
      .map((key) =>
        s3
          .getObject({
            Bucket: S3_ML_BUCKET_NAME,
            Key: key,
          })
          .promise()
      )
  );

  const objectDatas = objects
    .filter((obj) => Boolean(obj?.Body))
    .map((obj) => JSON.parse(obj.Body));

  const totalChars = objectDatas.reduce(
    (sum, objData) => objData.mean_confidence.count + sum,
    0
  );

  const totalScores = objectDatas.reduce(
    (sum, objData) =>
      objData.mean_confidence.score * objData.mean_confidence.count + sum,
    0
  );

  const confidence = totalScores / totalChars;
  const textUrl = `https://ml.ts-ai-kitkhe.ge/books/${bookId}/${bookId}.txt?${Date.now()}`;

  return {
    confidence: confidence ?? 0,
    textUrl: textUrl,
  };
}
