export function formatResponse(data) {
  // Basic formatting of response data
  if (typeof data === "string") {
    return data;
  }
  if (typeof data === "object") {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}
