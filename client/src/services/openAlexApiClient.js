/**
 * Import modules
 */
import axios from "axios";

/**
 * Configure Axios instance
 */
export const openAlexApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
