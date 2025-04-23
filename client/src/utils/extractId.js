/**
 * @function extractId
 * @description Extracts the identifier portion from a URL or path string
 */
export const extractId = (id) => {
  return id.split("/").pop();
};
