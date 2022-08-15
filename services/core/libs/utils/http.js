export function getBody(event) {
  try {
    return JSON.parse(event.body);
  } catch {
    return event.body;
  }
}
