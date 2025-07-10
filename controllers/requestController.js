import { httpClient } from "../services/httpClient.js";
import { formatResponse } from "../services/responseFormatter.js";

export async function handleRequest(message) {
  // Example: Echo the message or fetch some data
  if (message === "ping") {
    return "pong";
  }
  try {
    const response = await httpClient.get("/some-endpoint");
    return formatResponse(response.data);
  } catch (error) {
    return "Error fetching data.";
  }
}
