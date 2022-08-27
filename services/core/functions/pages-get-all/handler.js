import { getBookPagesByOrder } from "../../libs";

export async function main(event) {
  const bookId = event.pathParameters.id;
  const pages = await getBookPagesByOrder(bookId);

  return {
    statusCode: 200,
    body: JSON.stringify(
      pages.map((elem) => ({
        url: `https://assets.ts-ai-kitkhe.ge/${elem}`,
      }))
    ),
  };
}
