/**
 * @module openAlexApiClient
 * @description Configures Axios instance for OpenAlex API
 */

import axios from "axios";

/**
 * Axios instance with baseURL from environment variables
 */
export const openAlexApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
