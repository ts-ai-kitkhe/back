export function getBody(event) {
  try {
    return JSON.parse(event);
  } catch {
    return event.body;
  }
}
