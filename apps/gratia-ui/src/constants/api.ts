if (!process.env.API_URL) {
  throw new Error("API_URL is not set");
}

export const API_BASE_PATH = `${process.env.API_URL}/api`;
